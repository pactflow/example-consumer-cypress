import "spectre.css/dist/spectre.min.css";
import "spectre.css/dist/spectre-icons.min.css";
import "spectre.css/dist/spectre-exp.min.css";
import Layout from "./Layout";
import Heading from "./Heading";
import { useLocation } from "react-router-dom";

function ErrorPage() {
  const location = useLocation();
  const state = location.state as { error?: string } | null;
  const errorMessage = state?.error ?? "";

  return (
    <Layout>
      <Heading text="Sad times :(" href="/" />
      <div className="columns">
        <img
          className="column col-6"
          style={{ height: "100%" }}
          src={"./sad_panda.gif"}
          alt="sad_panda"
        />
        <pre
          className="code column col-6"
          style={{ wordWrap: "break-word" }}
        >
          <code>{errorMessage}</code>
        </pre>
      </div>
    </Layout>
  );
}

export default ErrorPage;
