import Query from "../../query/Query.tsx";
import AppProvider from "../../provider/AppProvider.tsx";
import I18n from "../../i18n/I18n.tsx";
import Theme from "../../theme/Theme.tsx";
import Menu from "./Menu.tsx";
import {Box} from "@mui/material";
import {Outlet} from "react-router-dom";
import Footer from "./Footer.tsx";
import Dialogs from "./Dialogs.tsx";
import {ConnectionStatus} from "../../pages/error/ConnectionStatus.tsx";
import {useAutoSignin} from "react-oidc-context";

export const Frame = () => {

    const {isLoading, isAuthenticated, error} = useAutoSignin({
        signinMethod: "signinRedirect",
        signinArgs: {
            state: window.location.pathname === "/" ? "/" : window.location.pathname,
            extraQueryParams: {
                mode: window.localStorage.getItem("mui-mode") ?? "system",
                ui_locales: window.localStorage.getItem("i18nextLng") ?? "en"
            }
        }
    });


    if (isLoading || !isAuthenticated || error) {
        return null;
    }

    return (
        <Query>
            <AppProvider>
                <I18n>
                    <Theme>
                        <Menu/>
                        <Box padding={{xs: 0, sm: 1}}>
                            <Outlet/>
                        </Box>
                        <Footer/>
                        <Dialogs/>
                        <ConnectionStatus/>
                    </Theme>
                </I18n>
            </AppProvider>
        </Query>
    );

}