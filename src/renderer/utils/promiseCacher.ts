import asyncLock from 'async-lock'
const cacheMap = new Map<string, {result?: any; resolveFns: Function[]; rejectFns: Function[]}>()
const lock = new asyncLock()
export const cached = <T extends Array<any>, U>(key: string, fn: (...args: T) => Promise<U>, ...args: T): Promise<U> => {
    return new Promise((resolve, reject) => {
        lock.acquire('cacheMap', () => {
            if (!cacheMap.has(key)) {
                cacheMap.set(key, {resolveFns: [resolve], rejectFns: [reject]})
                return true
            } else {
                const {result, resolveFns, rejectFns} = cacheMap.get(key)!
                if (result) {
                    resolve(result)
                } else {
                    resolveFns.push(resolve)
                    rejectFns.push(reject)
                }
                return false
            }
        }).then(requireExec => {
            if (requireExec) {
                fn(...args).then(result => {
                    lock.acquire('cacheMap', () => {
                        const {resolveFns} = cacheMap.get(key)!
                        cacheMap.set(key, {result, resolveFns: [], rejectFns: []})
                        resolveFns.forEach(resolveFn => resolveFn(result))
                    })
                }).catch(e => {
                    lock.acquire('cacheMap', () => {
                        const {rejectFns} = cacheMap.get(key)!
                        rejectFns.forEach(rejectFn => rejectFn(e))
                        cacheMap.delete(key)
                    })
                })
            }
        })
    })
}
