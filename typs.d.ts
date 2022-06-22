export type ACLFactoryOptions = Partial<{
  setPublicReadAccess: boolean;
  setPublicWriteAccess: boolean;
  setWriteAccess: [string, boolean];
  setReadAccess: [string, boolean];
}>;
