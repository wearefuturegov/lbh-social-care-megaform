import Head from "next/head"
import { Provider } from "next-auth/client"
import ProtectedPage from "../components/ProtectedPage"
import { AppProps } from "next/app"

import "../styles/index.scss"
import "../styles/helpers.scss"
import { FlashMessageProvider } from "../contexts/flashMessages"

if (typeof window !== "undefined") {
  document.body.className = document.body.className
    ? document.body.className + " js-enabled"
    : "js-enabled"
}

const App = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <Provider session={pageProps.session}>
    <FlashMessageProvider>
      <Head>
        <title>Social care | Hackney Council</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0b0c0c" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Head>

      <ProtectedPage>
        <Component {...pageProps} />
      </ProtectedPage>
    </FlashMessageProvider>
  </Provider>
)

export default App
