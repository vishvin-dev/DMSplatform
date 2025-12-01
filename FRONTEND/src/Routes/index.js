import React from 'react';
import { Routes, Route } from "react-router-dom";

//Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts/index";

//routes
import { authProtectedRoutes, publicRoutes } from "./allRoutes";
import { AuthProtected } from './AuthProtected';
import ReportPreview from "../pages/MIsReport/ReportPreview";
import BillingReport from "../pages/MIsReport/BillingReport"
import ReasonWiseBillingEfficiency from "../pages/MIsReport/ReasonWiseBillingEfficiency"
import ResetPassword from "../pages/Authentication/ResetPassword"
import ForcePasswordGuard from "../Routes/ForcePasswordGuard"
import ReportView from '../pages/Reports/ReportView';


const Index = () => {
    return (
        <React.Fragment>
            <Routes>
                <Route>
                    {publicRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={
                                <NonAuthLayout>
                                    {route.component}
                                </NonAuthLayout>
                            }
                            key={idx}
                            exact={true}
                        />
                    ))}
                    <Route path="reportPreview" element={<ReportPreview />} />
                    <Route path="billingReport" element={<BillingReport />} />
                    <Route path="reasonWiseBillingEfficiency" element={<ReasonWiseBillingEfficiency />} />
                    <Route path="report-view" element={<ReportView />} />


                    <Route
                        path="/ResetPassword"
                        element={
                            <VerticalLayout>
                                <ResetPassword isForcePasswordChange={false} />
                            </VerticalLayout>
                        }
                    />

                    <Route
                        path="/ForceResetPassword"
                        element={
                            <NonAuthLayout>
                                <ResetPassword isForcePasswordChange={true} />
                            </NonAuthLayout>
                        }
                    />



                    {authProtectedRoutes.map((route, idx) => (
                        <Route
                            path={route.path}
                            element={
                                <ForcePasswordGuard>
                                    <VerticalLayout>{route.component}</VerticalLayout>
                                </ForcePasswordGuard>
                            }
                            key={idx}
                            exact={true}
                        />
                    ))}
                </Route>
            </Routes>
        </React.Fragment>
    );
};

export default Index;