import Moralis from "moralis/types";
import { ACLFactoryOptions } from "./types";

// @ts-ignore: Unreachable code error
const Moralis = require("moralis/node");

export const moralisStart = async ({
  serverUrl,
  appId,
  masterKey,
}: {
  serverUrl: string;
  appId: string;
  masterKey: string;
}) => {
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

export const extractAttributes = (
  obj: Moralis.Object
): Record<string, unknown> => obj.attributes;

export const Collections = {
  findOne: async (
    matches,
    collection,
    options?: { useMasterKey: boolean }
  ): Promise<Moralis.Object | undefined> => {
    const query = moralisQueryFactory(collection);
    matches.forEach(([prop, value]) => {
      query.equalTo(prop, value);
    });
    return await query.first();
  },
  findMany: async (
    matches,
    collection,
    options?: { useMasterKey: boolean }
  ): Promise<Moralis.Object[]> => {
    const query = moralisQueryFactory(collection);
    matches.forEach(([prop, value]) => {
      query.equalTo(prop, value);
    });
    return await query.find();
  },
  create: async (
    data: Record<string, unknown>,
    collection: string,
    aclOptions?: ACLFactoryOptions
  ): Promise<Moralis.Object> => {
    const obj = moralisObjectFactory(collection, true);
    Object.entries(data).forEach(([key, value]) => {
      obj.set(key, value);
    });

    if (aclOptions) {
      const acl = moralisAclFactory(aclOptions);
      obj.setACL(acl);
    }

    return await obj.save();
  },
  update: async (
    updates: Record<string, unknown>,
    obj: Moralis.Object,
    options?: { useMasterKey: boolean }
  ): Promise<Moralis.Object> => {
    if (updates.length === 0) return obj;
    Object.entries(updates).forEach(([key, value]) => {
      obj.set(key, value);
    });
    if (options) return await obj.save(null, options);
    return await obj.save();
  },
} as const;
