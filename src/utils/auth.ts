import {AuthProviderProps} from "react-oidc-context";
import {OidcClientSettings, User, WebStorageStateStore} from "oidc-client-ts";

export const authConfig: AuthProviderProps = {
    //authority: "http://localhost:8080/realms/proof",
    authority: "https://proof-resur-keycloak.cloud.iai.kit.edu/realms/proof ",
    client_id: "proof-public",
    redirect_uri: window.location.href,
    post_logout_redirect_uri: window.location.href,
    response_type: "code",
    response_mode: "query",
    scope: "openid profile roles",
    loadUserInfo: true,
    stateStore: new WebStorageStateStore({store: window.sessionStorage}),
    userStore: new WebStorageStateStore({store: window.sessionStorage}),
    automaticSilentRenew: true,
    onSigninCallback: (user: User | void): void => {
        if (user) {
            const url: string = user.state as string;
            window.history.replaceState({}, window.document.title, window.location.origin + window.location.pathname);
            window.location.href = url || "/";
        }
    }
};

export const isAdmin = (user: User): boolean => {
    const profile: any = user.profile;
    return profile.realm_access.roles.includes("ADMIN")
}

export const isUser = (user: User): boolean => {
    const profile: any = user.profile;
    return profile.realm_access.roles.includes("USER")
}

export const getUser: () => (User | null) = (): User | null => {
    const oidcStorage: string | null = sessionStorage.getItem(`oidc.user:${(authConfig as OidcClientSettings).authority}:${(authConfig as OidcClientSettings).client_id}`);
    if (!oidcStorage) {
        return null;
    }
    return User.fromStorageString(oidcStorage);
};