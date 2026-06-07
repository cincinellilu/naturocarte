type AdminAuthGateProps = {
  eyebrow: string;
  title: string;
  description: string;
  nextPath: string;
  errorMessage?: string | null;
};

export default function AdminAuthGate({
  eyebrow,
  title,
  description,
  nextPath,
  errorMessage
}: AdminAuthGateProps) {
  return (
    <article className="article-shell admin-auth-page">
      <section className="admin-gate">
        <p className="page-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-lead">{description}</p>

        {errorMessage ? <p className="page-alert">{errorMessage}</p> : null}

        <form className="admin-login-form" action="/admin/prospects/login" method="post">
          <input type="hidden" name="next" value={nextPath} />
          <label className="admin-prospects-label" htmlFor="admin-password">
            Mot de passe admin
          </label>
          <input
            id="admin-password"
            className="admin-prospects-input"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <button className="btn" type="submit">
            Ouvrir l’admin
          </button>
        </form>
      </section>
    </article>
  );
}
