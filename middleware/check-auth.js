export default function (context) {
  console.log('[middleware] middleware "check-auth" is running');
  context.store.dispatch('initAuth', context.req);
}
