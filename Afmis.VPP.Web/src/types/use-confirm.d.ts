declare module "use-confirm" {
  export function createConfirm(): {
    ConfirmContextProvider: React.JSX;
    useConfirm: () => {
      ask: (val: string) => Promise<boolean>;
      isAsking: boolean;
      message: string;
      deny: () => any;
      confirm: () => any;
    };
  };
}
