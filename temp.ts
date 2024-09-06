import { setup, fromPromise, assign, createActor } from "xstate"

const machine = setup({
  types: {
    context: {} as {
      stream?: any;
      result?: string;
    },
    events: {} as
      | { type: "START" }
      | { type: "RESULT" }
      | { type: "FINISH" },
  },
  actors: {
    createStream: fromPromise<string, { prompt: string} >(async ({ input }) => {
      // const session = window.ai.createTextSession();
      // const stream = session.promptStreaming(input.prompt);
      return `MY_STREAM(${input.prompt})`;
    }),
    readStream: fromPromise<string, { stream: any }>(async ({ input }) => {
      console.log(`Reading ${input.stream}`)
      return "MY_RESULT";
    })
  },
}).createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: {
          target: "starting",
        },
      },
    },
    starting: {
      invoke: {
        id: "getStream",
        src: "createStream",
        input: { prompt: "Hello world" },
        onDone: {
          target: "generating",
          actions: assign({
            stream: ({ event }) => event.output,
          }),
        },
      },
    },
    generating: {
      invoke: {
        id: 'readStream',
        src: "readStream",
        input: ({ context }) => ({ stream: context.stream }),
        onDone: {
          target: "idle",
          actions: assign({
            result: ({ event }) => event.output,
          }),
        },
      }
    },
  },
});

const actor = createActor(machine);

actor.subscribe((snapshot) => {
  console.log('Value:', snapshot.value);
  console.log('Context:', snapshot.context);
});

actor.start();
actor.send({ type: 'START' });
