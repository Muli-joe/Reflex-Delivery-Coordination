import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import Dashboard from '@/pages/dashboard';
import Deliveries from '@/pages/deliveries';
import Riders from '@/pages/riders';
import RiderMode from '@/pages/rider';
import Settings from '@/pages/settings';
import { Shell } from '@/components/shell';
import { Link, Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside',
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
  },
  variables: {
    colorPrimary: '#17655f',
    colorForeground: '#243331',
    colorMutedForeground: '#6e7c79',
    colorDanger: '#b53d35',
    colorBackground: '#fffdfa',
    colorInput: '#fbfaf6',
    colorInputForeground: '#243331',
    colorNeutral: '#ddd9cf',
    fontFamily: 'Manrope, sans-serif',
    borderRadius: '0.65rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fffdfa] rounded-[18px] w-[440px] max-w-full overflow-hidden border border-[#ddd9cf] shadow-[0_18px_50px_rgba(36,51,49,0.09)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#243331] font-bold tracking-[-0.04em]',
    headerSubtitle: 'text-[#6e7c79]',
    socialButtonsBlockButtonText: 'text-[#243331] font-semibold',
    formFieldLabel: 'text-[#243331] font-semibold',
    footerActionLink: 'text-[#17655f] font-semibold',
    footerActionText: 'text-[#6e7c79]',
    dividerText: 'text-[#6e7c79]',
    identityPreviewEditButton: 'text-[#17655f]',
    formFieldSuccessText: 'text-[#17655f]',
    alertText: 'text-[#b53d35]',
    logoBox: 'h-10',
    logoImage: 'h-10 w-10',
    socialButtonsBlockButton: 'border-[#ddd9cf] bg-[#fbfaf6] hover:bg-[#f2efe7]',
    formButtonPrimary: 'bg-[#17655f] hover:bg-[#12524e] text-[#fffdfa] font-bold',
    formFieldInput: 'border-[#cfcac0] bg-[#fbfaf6] text-[#243331]',
    footerAction: 'border-t border-[#eeeae1]',
    dividerLine: 'bg-[#ddd9cf]',
    alert: 'border-[#edc3bf] bg-[#fff4f2]',
    otpCodeFieldInput: 'border-[#cfcac0] bg-[#fbfaf6] text-[#243331]',
    formFieldRow: 'gap-2',
    main: 'gap-5',
  },
};

function LandingPage() {
  return (
    <main className="auth-landing">
      <section className="auth-landing-story">
        <Link href="/" className="brand-mark auth-brand">
          <span className="brand-symbol">R</span>
          <span>
            <span className="brand-name">reflex</span>
            <span className="brand-sub">operations desk</span>
          </span>
        </Link>
        <div className="auth-story-copy">
          <div className="eyebrow">Delivery coordination for teams on the move</div>
          <h1>Keep every handoff moving.</h1>
          <p>
            Reflex gives Kenyan retailers one calm place to dispatch deliveries,
            support riders, and see what needs attention next.
          </p>
          <div className="auth-proof">
            <span className="auth-proof-mark">✓</span>
            <span>One clear view from request to doorstep.</span>
          </div>
        </div>
        <div className="auth-landing-footer">
          <span>Built for the moving parts.</span>
          <span className="auth-footer-dot" />
          <span>Nairobi · Kenya</span>
        </div>
      </section>
      <section className="auth-landing-action">
        <div className="auth-welcome-card">
          <span className="auth-kicker">Welcome to Reflex</span>
          <h2>Your desk is ready.</h2>
          <p>Sign in to pick up where your team left off.</p>
          <Link href="/sign-in" className="btn btn-primary auth-cta" data-testid="link-sign-in">
            Sign in to your desk
          </Link>
          <p className="auth-secondary-copy">
            New to Reflex? <Link href="/sign-up" data-testid="link-sign-up">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-page-story">
        <Link href="/" className="brand-mark auth-brand">
          <span className="brand-symbol">R</span>
          <span>
            <span className="brand-name">reflex</span>
            <span className="brand-sub">operations desk</span>
          </span>
        </Link>
        <div className="auth-page-message">
          <div className="eyebrow">Back to the work</div>
          <h1>Move the day forward.</h1>
          <p>Sign in to coordinate the next delivery with a little more clarity.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
        />
      </div>
    </main>
  );
}

function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-page-story">
        <Link href="/" className="brand-mark auth-brand">
          <span className="brand-symbol">R</span>
          <span>
            <span className="brand-name">reflex</span>
            <span className="brand-sub">operations desk</span>
          </span>
        </Link>
        <div className="auth-page-message">
          <div className="eyebrow">Start with a clear handoff</div>
          <h1>Give your team room to move.</h1>
          <p>Create a Reflex workspace for the people coordinating every delivery.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
        />
      </div>
    </main>
  );
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ children }) {
  return (
    <>
      <Show when="signed-in">
        <RoutedErrorBoundary>
          <Shell>{children}</Shell>
        </RoutedErrorBoundary>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function OperationsRoutes() {
  return (
    <Switch>
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/deliveries">
        <ProtectedRoute><Deliveries /></ProtectedRoute>
      </Route>
      <Route path="/riders">
        <ProtectedRoute><Riders /></ProtectedRoute>
      </Route>
      <Route path="/rider">
        <ProtectedRoute><RiderMode /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>
      <Route>
        <ProtectedRoute><NotFound /></ProtectedRoute>
      </Route>
    </Switch>
  );
}

function RoutedErrorBoundary({ children }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      if (user) queryClient.invalidateQueries();
      else queryClient.clear();
    });
    return unsubscribe;
  }, [addListener]);

  return null;
}

function ClerkApp() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: 'Welcome back',
            subtitle: 'Sign in to access your operations desk',
          },
        },
        signUp: {
          start: {
            title: 'Create your Reflex workspace',
            subtitle: 'Keep every handoff moving',
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={OperationsRoutes} />
      </Switch>
    </ClerkProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={basePath}>
        <ClerkApp />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;