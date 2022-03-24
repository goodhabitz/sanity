import {useDatastores} from '@sanity/base'
import {isRecord, isString} from '@sanity/base/util'
import {SanityClient} from '@sanity/client'
import {useMemoObservable} from 'react-rx'
import {map, startWith} from 'rxjs/operators'

type LoadState<T> =
  | {status: 'loading'}
  | {
      status: 'loaded'
      result: T | undefined
    }
  | {status: 'error'; error: Error}

export function useCrossProjectToken(
  client: SanityClient,
  {projectId, tokenId}: {tokenId?: string; projectId: string}
): LoadState<string> | undefined {
  const {crossProjectTokenStore, documentPreviewStore} = useDatastores()

  return useMemoObservable(() => {
    return documentPreviewStore
      .observePaths(crossProjectTokenStore.getTokenDocumentId({projectId, tokenId}), ['token'])
      .pipe(
        map((documentValue) => {
          const value: Record<string, unknown> | undefined = isRecord(documentValue)
            ? documentValue
            : undefined

          return {
            status: 'loaded',
            result: isString(value?.token) ? value?.token : undefined,
          } as const
        }),
        startWith({status: 'loading'} as const)
      )
  }, [client, crossProjectTokenStore, documentPreviewStore, projectId, tokenId])
}
