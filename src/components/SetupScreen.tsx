export function SetupScreen() {
  return (
    <div className="overlay">
      <div className="join setup">
        <img src="/hearth.svg" alt="" className="join__logo" />
        <h1>Connect Hearth to Appwrite</h1>
        <ol className="setup__steps">
          <li>
            Create a project on{' '}
            <a href="https://cloud.appwrite.io" target="_blank" rel="noreferrer">
              Appwrite Cloud
            </a>{' '}
            and add a Web platform for this hostname.
          </li>
          <li>
            Copy <code>.env.example</code> to <code>.env</code> and fill in the endpoint, project ID and a server API key.
          </li>
          <li>
            Run <code>npm run setup</code> to create the tables, then <code>npm run seed</code> for demo data.
          </li>
          <li>
            Restart <code>npm run dev</code>.
          </li>
        </ol>
      </div>
    </div>
  );
}
