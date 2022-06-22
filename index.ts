import Moralis from "moralis/types";
import { ACLFactoryOptions } from "./types";

// @ts-ignore: Unreachable code error
const Moralis = require("moralis/node");

export const moralisStart = async ({ serverUrl, appId, masterKey }) => {
  return await Moralis.start({ serverUrl, appId, masterKey });
};

export const moralisObjectFactory = <T extends string>(
  collection: T,
  createNewInstance = false
) => {
  const Obj = Moralis.Object.extends(collection);
  return createNewInstance ? new Obj() : Obj;
};

export const moralisQueryFactory = <T extends string>(collection: T) => {
  return new Moralis.Query(moralisObjectFactory(collection));
};

export const moralisAclFactory = <T extends string>(
  options?: ACLFactoryOptions
) => {
  const acl = new Moralis.ACL();

  if (options) {
    const {
      setPublicReadAccess,
      setPublicWriteAccess,
      setWriteAccess,
      setReadAccess,
    } = options;

    setPublicReadAccess && acl.setPublicReadAccess(setPublicReadAccess);
    setPublicWriteAccess && acl.setPublicWriteAccess(setPublicWriteAccess);
    setWriteAccess && acl.setWriteAccess(setWriteAccess[0], setWriteAccess[1]);
    setReadAccess && acl.setReadAccess(setReadAccess[0], setReadAccess[1]);
  }

  return acl;
};

export const Query = {
  findOne: async (matches, collection): Promise<Moralis.Object | undefined> => {
    const query = moralisQueryFactory(collection);
    matches.forEach(([prop, value]) => {
      query.equalTo(prop, value);
    });
    return await query.first();
  },
  findMany: async (matches, collection): Promise<Moralis.Object[]> => {
    const query = moralisQueryFactory(collection);
    matches.forEach(([prop, value]) => {
      query.equalTo(prop, value);
    });
    return await query.find();
  },
} as const;
