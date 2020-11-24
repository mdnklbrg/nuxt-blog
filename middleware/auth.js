export default function (context) {
  console.log('[middleware] middleware "auth" is running');
  if (!context.store.getters.isAuthenticated) {
    context.redirect('/admin/auth');
  }
}
