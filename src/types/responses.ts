export type PublicCommitInfo = {
  shortHash: string;
  date: string;
};

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ErrorResponse = {
  error: string;
  requestId: string;
  issues?: ValidationIssue[];
};

export type HealthResponse = {
  status: "ok";
  commit: PublicCommitInfo | null;
};
