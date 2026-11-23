/**
 * The registry pairing each provider with its internal host. Held weakly,
 * so a provider nothing else holds is collected with its host; keyed by
 * the provider object, so a structural copy finds nothing; held untyped,
 * since one map serves every field list and record type. A `WeakMap`
 * cannot be frozen, so it lives here rather than among the constants.
 */
const PROVIDER_HOSTS = new WeakMap<object, unknown>();

/**
 * Read the registry pairing each provider with its host: the same map on
 * every call. A host is read back at the type of the provider it was
 * registered with.
 *
 * @note Impure: the registry is module state that registering a provider
 * writes.
 */
export default function readProviderRegistry(): WeakMap<object, unknown> {
  return PROVIDER_HOSTS;
}
