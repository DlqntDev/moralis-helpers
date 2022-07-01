import MoralisTypes from 'moralis/types'
import { ACLFactoryOptions } from './types'

// @ts-ignore: Unreachable code error
import Moralis from 'moralis'

type MoralisStart = {
  serverUrl: string
  appId: string
  masterKey: string
}

type Matchers<T> = Array<[string, T]>

export const moralisStart = async ({
  serverUrl,
  appId,
  masterKey,
}: MoralisStart) => {
  return await Moralis.start({ serverUrl, appId, masterKey })
}

export const moralisObjectFactory = <T extends Record<string, string>>(
  collection: T[keyof T],
  createNewInstance = false
) => {
  const Obj = Moralis.Object.extend(collection)
  return createNewInstance ? new Obj() : Obj
}

export const moralisQueryFactory = <
  T extends Record<string, unknown> = Record<string, unknown>,
  K extends Record<string, string> = Record<string, string>
>(
  collection: K[keyof K]
) => {
  return new Moralis.Query<Moralis.Object<T>>(moralisObjectFactory(collection))
}
export const moralisAclFactory = (options?: ACLFactoryOptions) => {
  const acl = new Moralis.ACL()

  if (options) {
    const {
      setPublicReadAccess,
      setPublicWriteAccess,
      setWriteAccess,
      setReadAccess,
    } = options

    setPublicReadAccess && acl.setPublicReadAccess(setPublicReadAccess)
    setPublicWriteAccess && acl.setPublicWriteAccess(setPublicWriteAccess)
    setWriteAccess && acl.setWriteAccess(setWriteAccess[0], setWriteAccess[1])
    setReadAccess && acl.setReadAccess(setReadAccess[0], setReadAccess[1])
  }

  return acl
}

export const extractAttributes = (
  obj: MoralisTypes.Object
): Record<string, unknown> => obj.attributes

export const Collections = {
  findOne: async <
    T extends Record<string, unknown>,
    K extends Record<string, string>
  >(
    matches: Matchers<T[keyof T]>,
    collection: K[keyof K],
    options?: { useMasterKey: boolean }
  ): Promise<Moralis.Object<T>> => {
    const query = moralisQueryFactory<T>(collection)
    matches.forEach(([prop, value]) => {
      query.equalTo(prop, value)
    })

    return options?.useMasterKey
      ? await query.first({ useMasterKey: true })
      : await query.first()
  },
  findMany: async <
    T extends Record<string, unknown>,
    K extends Record<string, string>
  >(
    matches: Matchers<T[keyof T]>,
    collection: K[keyof K],
    options?: { useMasterKey: boolean }
  ): Promise<MoralisTypes.Object<T>[]> => {
    const query = moralisQueryFactory<T>(collection)

    matches.forEach(([prop, value]) => {
      query.equalTo(prop, value)
    })

    return options?.useMasterKey
      ? await query.find({ useMasterkey: true } as Moralis.Query.FindOptions)
      : await query.find()
  },

  create: async <
    T extends Record<string, unknown>,
    K extends Record<string, string>
  >(
    data: T,
    collection: K[keyof K],
    aclOptions?: ACLFactoryOptions
  ): Promise<MoralisTypes.Object> => {
    const obj = moralisObjectFactory(collection, true)
    Object.entries(data).forEach(([key, value]) => {
      obj.set(key, value)
    })

    if (aclOptions) {
      const acl = moralisAclFactory(aclOptions)
      obj.setACL(acl)
    }

    return await obj.save()
  },
  update: async (
    updates: Record<string, unknown>,
    obj: MoralisTypes.Object,
    options?: { useMasterKey: boolean }
  ): Promise<MoralisTypes.Object> => {
    if (updates.length === 0) return obj
    Object.entries(updates).forEach(([key, value]) => {
      obj.set(key, value)
    })
    if (options) return await obj.save(null, options)
    return await obj.save()
  },
} as const
