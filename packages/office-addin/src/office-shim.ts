export interface OfficeLike {
  onReady(callback: () => void): void;
  context?: {
    document?: {
      setSelectedDataAsync(
        data: string,
        options: { coercionType: string },
        callback?: (result: { status: string; error?: { message: string } }) => void
      ): void;
    };
  };
  CoercionType?: {
    Html: string;
  };
  AsyncResultStatus?: {
    Failed: string;
  };
}

declare global {
  interface Window {
    Office?: OfficeLike;
  }
}

export function getOffice(): OfficeLike | undefined {
  return typeof window !== "undefined" ? window.Office : undefined;
}
