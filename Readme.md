# 📘 Lógica pra mover pro backend e suas localizações!

**Objetivo:** Mapear as regras de "Baba/Pelada" implementadas no Frontend (React Native/Expo) para replicação no Backend.
**Status Atual:** As regras rodam localmente via `MatchContext` (Estado em Memória).

---

## 1. Configuração Inicial da Partida

**Regra:** Toda partida começa com o placar 0x0, cronômetro em 6 minutos (360 segundos) e estado **pausado**.

* **Arquivo:** `src/context/MatchContext.tsx`
* **Localização:** Função `startMatch` e `nextMatch`.

```typescript
// src/context/MatchContext.tsx

// Definição do tempo regulamentar
gameTime: 6 * 60, // 6 minutos em segundos

// Inicialização (Estado Pausado por padrão para controle do juiz)
isRunning: false, 
scoreA: 0,
scoreB: 0,

```

---

## 2. Condições de Encerramento (Game Over)

**Regra:** O jogo deve ser interrompido automaticamente se uma das duas condições for atendida:

1. **Tempo Esgotado:** O cronômetro chega a 00:00.
2. **Golden Goal / Mercy Rule:** Um time marca **2 gols**. "Quem faz 2 ganha".

* **Arquivo:** `src/context/MatchContext.tsx`

### A. Controle de Tempo (Timer Regressivo)

* **Localização:** `useEffect` que monitora `isRunning`.

```typescript
// src/context/MatchContext.tsx

useEffect(() => {
  // ...
  // Se o tempo chegar a 1 ou menos, para o jogo.
  if (prev.gameTime <= 1) {
    return { ...prev, gameTime: 0, isRunning: false };
  }
  // ...
}, [matchState.isRunning]);

```

### B. Regra de 2 Gols (Vitória Imediata)

* **Localização:** Função `addGoal`.

```typescript
// src/context/MatchContext.tsx - Dentro de addGoal

// Verifica se o placar atingiu o limite
const isFinished = newScoreA >= 2 || newScoreB >= 2;

return {
  // ...
  // Se alguém fez 2 gols, isRunning vira false (Pausa o jogo)
  isRunning: !isFinished 
};

```

---

## 3. Sistema de Fila e Rotação ("Rei da Mesa")

**Regra:** Ao finalizar a partida e avançar a fila:

1. **Vencedor:** Permanece em campo (Time A / Index 0).
2. **Perdedor:** Vai para o **final** da fila.
3. **Desafiante:** O primeiro time da fila de espera entra para jogar (Time B / Index 1).
4. **Empate:** Por convenção, o time que já estava na posição de "Rei" (Time A/Index 0) permanece.

* **Arquivo:** `src/context/MatchContext.tsx`
* **Localização:** Função `nextMatch` (A lógica mais complexa do app).

```typescript
// src/context/MatchContext.tsx - Dentro de nextMatch

// 1. Identificar Vencedor (Empate favorece quem já está no Index 0)
const winnerIndex = prev.scoreA >= prev.scoreB ? 0 : 1;
const loserIndex = winnerIndex === 0 ? 1 : 0;

const winnerTeam = teams[winnerIndex];
const loserTeam = teams[loserIndex];

// 2. Manipular a Fila
const waitingTeams = teams.slice(2); // Pega do 3º time em diante

// 3. Montar Nova Ordem
const newOrder = [
  winnerTeam,       // Vencedor vira o novo Time A (Rei)
  ...waitingTeams,  // A fila anda (o antigo 3º vira o novo Time B)
  loserTeam         // Perdedor vai para o último lugar
];

```

---

## 4. Sistema de Jogador "Complete" (Guest Player)

**Regra:** Se um time estiver incompleto, ele pode pegar emprestado um jogador que está na fila de espera. Esse jogador atua temporariamente naquele time, mas sua matrícula original (Team ID) não muda.

* **Arquivo:** `src/context/MatchContext.tsx`
* **Localização:** Função `addGuestPlayer` e State `guestPlayersA` / `guestPlayersB`.

```typescript
// src/context/MatchContext.tsx

// Adiciona o jogador na lista temporária do Time A ou B
const addGuestPlayer = (teamIndex: 0 | 1, player: Player) => {
  setMatchState(prev => ({
    ...prev,
    guestPlayersA: teamIndex === 0 ? [...prev.guestPlayersA, player] : prev.guestPlayersA,
    // ... lógica análoga para Time B
  }));
};

```

---

## 5. Resolução de Conflitos de "Complete" (A Regra do Traíra)

**Regra Crítica:** Se um jogador "Complete" ganhar a partida pelo time emprestado, ele normalmente continuaria em campo. **PORÉM**, se o próximo time da fila for justamente o **time original** desse jogador:

1. O jogador deve ser **removido automaticamente** do time vencedor (onde era convidado).
2. Ele deve voltar para seu time de origem para jogar contra o time que ele acabou de defender.
3. O Frontend deve notificar o usuário dessa remoção.

* **Arquivo:** `src/context/MatchContext.tsx`
* **Localização:** Função `nextMatch` (Bloco de filtragem de convidados).

```typescript
// src/context/MatchContext.tsx - Dentro de nextMatch

// Lista de jogadores que compõem o próximo time desafiante (Time B da nova rodada)
const challengerRosterIds = newOrder[1].players.map(p => p.id);

// Verifica os convidados atuais do time vencedor
const winnerCurrentGuests = winnerIndex === 0 ? prev.guestPlayersA : prev.guestPlayersB;

// FILTRO: Remove o convidado se o ID dele estiver no time desafiante
const keptGuests = winnerCurrentGuests.filter(guest => !challengerRosterIds.includes(guest.id));
const removedGuests = winnerCurrentGuests.filter(guest => challengerRosterIds.includes(guest.id));

// Retorna os nomes removidos para exibir no Alert do Frontend
return removedGuests.map(p => p.name);

```

* **Arquivo:** `app/game/index.tsx`
* **Localização:** Função `handleFinish` (Consumo do retorno).

```typescript
// app/game/index.tsx

const removedPlayers = nextMatch(); // Executa a rotação e pega as baixas

if (removedPlayers.length > 0) {
    Alert.alert("Baixa no Time!", `Jogadores removidos: ${removedPlayers.join(', ')}...`);
}

```

---

## 6. Registro de Gols e Assistências

**Regra:** Um gol é composto por: Autor (obrigatório), Minuto (calculado) e Assistência (opcional). O fluxo de UI exige que primeiro se selecione o Autor, e depois abre-se um Modal para a Assistência.

* **Arquivo:** `src/context/MatchContext.tsx`
* **Localização:** Função `addGoal`.

```typescript
// src/context/MatchContext.tsx

const addGoal = (teamIndex: 0 | 1, playerId: string, assistPlayerId?: string) => {
    // ...
    const newGoal: Goal = {
        id: Math.random().toString(),
        playerId: playerId,          // Quem fez
        assistPlayerId: assistPlayerId, // Quem tocou (pode ser undefined)
        minute: Math.floor((360 - prev.gameTime) / 60), // Minuto da partida (0 a 5)
    };
    // ...
}

```

---

## 📝 Resumo de Endpoints Backend Sugeridos

Baseado nessas regras, o Backend precisará das seguintes rotas/lógicas:

1. `POST /matches/start`: Recebe lista de times, inicia fila.
2. `POST /matches/goal`: Registra gol (Autor + Assistência). Valida se chegou a 2 gols.
3. `POST /matches/guest`: Adiciona um jogador de outro time como convidado na partida atual.
4. `POST /matches/finish`: Finaliza partida, salva histórico.
5. `POST /matches/rotate` **(Crítico)**: Executa a lógica do item 3 (Fila) e item 5 (Conflito de Complete), retornando o novo estado da fila e alertas de jogadores removidos.