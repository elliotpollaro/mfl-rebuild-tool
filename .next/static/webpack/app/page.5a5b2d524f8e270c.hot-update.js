"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./src/components/auth-header.tsx":
/*!****************************************!*\
  !*** ./src/components/auth-header.tsx ***!
  \****************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ AuthHeader; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_ui_button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/ui/button */ \"(app-pages-browser)/./src/components/ui/button.tsx\");\n/* harmony import */ var _components_ui_input__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/components/ui/input */ \"(app-pages-browser)/./src/components/ui/input.tsx\");\n/* harmony import */ var _components_ui_select__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/components/ui/select */ \"(app-pages-browser)/./src/components/ui/select.tsx\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n\nfunction AuthHeader(param) {\n    let { onLeagueChange } = param;\n    var _leagues_find;\n    _s();\n    const [username, setUsername] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const [password, setPassword] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const [leagues, setLeagues] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const [selectedLeague, setSelectedLeague] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [isAuthenticated, setIsAuthenticated] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        checkAuthStatus();\n    }, []);\n    const checkAuthStatus = async ()=>{\n        try {\n            const response = await fetch(\"http://localhost:5000/api/auth/status\", {\n                credentials: \"include\",\n                headers: {\n                    \"Accept\": \"application/json\"\n                }\n            });\n            const data = await response.json();\n            setIsAuthenticated(data.authenticated);\n            if (data.authenticated) {\n                const leaguesResponse = await fetch(\"http://localhost:5000/api/auth/leagues\", {\n                    credentials: \"include\",\n                    headers: {\n                        \"Accept\": \"application/json\"\n                    }\n                });\n                const leaguesData = await leaguesResponse.json();\n                if (leaguesData.success) {\n                    setLeagues(leaguesData.leagues);\n                    if (data.league_id) {\n                        setSelectedLeague(data.league_id);\n                        onLeagueChange(data.league_id);\n                    }\n                } else {\n                    setError(\"Failed to fetch leagues\");\n                }\n            }\n        } catch (error) {\n            console.error(\"Error checking auth status:\", error);\n            setError(\"Failed to check authentication status\");\n        }\n    };\n    const handleLogin = async (e)=>{\n        e.preventDefault();\n        if (!username || !password) {\n            setError(\"Username and password are required\");\n            return;\n        }\n        setIsLoading(true);\n        setError(null);\n        try {\n            const response = await fetch(\"http://localhost:5000/api/auth/login\", {\n                method: \"POST\",\n                credentials: \"include\",\n                headers: {\n                    \"Content-Type\": \"application/json\",\n                    \"Accept\": \"application/json\"\n                },\n                body: JSON.stringify({\n                    username,\n                    password\n                })\n            });\n            const data = await response.json();\n            if (response.ok && data.success) {\n                setIsAuthenticated(true);\n                setLeagues(data.leagues || []);\n                setPassword(\"\") // Clear password for security\n                ;\n                setError(null) // Clear any previous errors\n                ;\n            } else {\n                console.error(\"Login failed:\", data);\n                setError(data.error || \"Login failed. Please check your credentials.\");\n            }\n        } catch (error) {\n            console.error(\"Login error:\", error);\n            setError(\"Failed to connect to server. Please try again.\");\n        } finally{\n            setIsLoading(false);\n        }\n    };\n    const handleLogout = async ()=>{\n        try {\n            const response = await fetch(\"http://localhost:5000/api/auth/logout\", {\n                method: \"POST\",\n                credentials: \"include\",\n                headers: {\n                    \"Accept\": \"application/json\"\n                }\n            });\n            if (response.ok) {\n                setIsAuthenticated(false);\n                setSelectedLeague(null);\n                setLeagues([]);\n                onLeagueChange(null);\n                setUsername(\"\");\n                setPassword(\"\");\n            } else {\n                const data = await response.json();\n                setError(data.error || \"Failed to logout\");\n            }\n        } catch (error) {\n            console.error(\"Error logging out:\", error);\n            setError(\"Failed to logout\");\n        }\n    };\n    const handleLeagueChange = async (leagueId)=>{\n        setSelectedLeague(leagueId);\n        try {\n            const response = await fetch(\"http://localhost:5000/api/auth/select-league\", {\n                method: \"POST\",\n                credentials: \"include\",\n                headers: {\n                    \"Content-Type\": \"application/json\",\n                    \"Accept\": \"application/json\"\n                },\n                body: JSON.stringify({\n                    league_id: leagueId\n                })\n            });\n            const data = await response.json();\n            if (data.success) {\n                onLeagueChange(leagueId);\n            } else {\n                setError(data.error || \"Failed to select league\");\n            }\n        } catch (error) {\n            console.error(\"Error selecting league:\", error);\n            setError(\"Failed to select league\");\n        }\n    };\n    const handleKeyPress = (e)=>{\n        if (e.key === \"Enter\") {\n            handleLogin(e);\n        }\n    };\n    if (!isAuthenticated) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"bg-gray-800/50 rounded-lg p-4 mb-8\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"flex flex-wrap gap-4 items-center\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_input__WEBPACK_IMPORTED_MODULE_3__.Input, {\n                        type: \"text\",\n                        placeholder: \"MFL Username\",\n                        value: username,\n                        onChange: (e)=>setUsername(e.target.value),\n                        onKeyPress: handleKeyPress,\n                        className: \"flex-1 min-w-[200px]\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                        lineNumber: 173,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_input__WEBPACK_IMPORTED_MODULE_3__.Input, {\n                        type: \"password\",\n                        placeholder: \"Password\",\n                        value: password,\n                        onChange: (e)=>setPassword(e.target.value),\n                        onKeyPress: handleKeyPress,\n                        className: \"flex-1 min-w-[200px]\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                        lineNumber: 181,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_button__WEBPACK_IMPORTED_MODULE_2__.Button, {\n                        onClick: handleLogin,\n                        disabled: isLoading || !username || !password,\n                        className: \"bg-blue-600 hover:bg-blue-700 w-full sm:w-auto\",\n                        children: isLoading ? \"Logging in...\" : \"Login with MFL\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                        lineNumber: 189,\n                        columnNumber: 11\n                    }, this),\n                    error && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"text-red-400 text-sm w-full\",\n                        children: error\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                        lineNumber: 196,\n                        columnNumber: 21\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                lineNumber: 172,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n            lineNumber: 171,\n            columnNumber: 7\n        }, this);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"bg-gray-800/50 rounded-lg p-4 mb-8\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"flex flex-wrap gap-4 items-center\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_select__WEBPACK_IMPORTED_MODULE_4__.Select, {\n                        value: selectedLeague || \"\",\n                        onValueChange: handleLeagueChange,\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_select__WEBPACK_IMPORTED_MODULE_4__.SelectTrigger, {\n                                className: \"flex-1 min-w-[200px]\",\n                                children: selectedLeague ? ((_leagues_find = leagues.find((l)=>l.id === selectedLeague)) === null || _leagues_find === void 0 ? void 0 : _leagues_find.name) || \"Select League\" : \"Select League\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                                lineNumber: 206,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_select__WEBPACK_IMPORTED_MODULE_4__.SelectContent, {\n                                children: leagues.map((league)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_select__WEBPACK_IMPORTED_MODULE_4__.SelectItem, {\n                                        value: league.id,\n                                        children: league.name\n                                    }, league.id, false, {\n                                        fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                                        lineNumber: 213,\n                                        columnNumber: 15\n                                    }, this))\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                                lineNumber: 211,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                        lineNumber: 205,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_button__WEBPACK_IMPORTED_MODULE_2__.Button, {\n                        onClick: handleLogout,\n                        variant: \"outline\",\n                        className: \"w-full sm:w-auto\",\n                        children: \"Logout\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                        lineNumber: 219,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                lineNumber: 204,\n                columnNumber: 7\n            }, this),\n            error ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"text-red-400 text-sm mt-2\",\n                children: error\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                lineNumber: 228,\n                columnNumber: 9\n            }, this) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"text-gray-100 text-sm mt-2\",\n                children: \"Successfully logged in\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n                lineNumber: 230,\n                columnNumber: 9\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\ellio\\\\Downloads\\\\pymfl-main\\\\src\\\\components\\\\auth-header.tsx\",\n        lineNumber: 203,\n        columnNumber: 5\n    }, this);\n}\n_s(AuthHeader, \"tHwy3T+rSZGWYtseMhmd7Vhr1IU=\");\n_c = AuthHeader;\nvar _c;\n$RefreshReg$(_c, \"AuthHeader\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL2F1dGgtaGVhZGVyLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFOEI7QUFDYTtBQUNJO0FBQ0Y7QUFNZDtBQVdoQixTQUFTUyxXQUFXLEtBQW1DO1FBQW5DLEVBQUVDLGNBQWMsRUFBbUIsR0FBbkM7UUF5THJCQzs7SUF4TFosTUFBTSxDQUFDQyxVQUFVQyxZQUFZLEdBQUdaLCtDQUFRQSxDQUFDO0lBQ3pDLE1BQU0sQ0FBQ2EsVUFBVUMsWUFBWSxHQUFHZCwrQ0FBUUEsQ0FBQztJQUN6QyxNQUFNLENBQUNVLFNBQVNLLFdBQVcsR0FBR2YsK0NBQVFBLENBQVcsRUFBRTtJQUNuRCxNQUFNLENBQUNnQixnQkFBZ0JDLGtCQUFrQixHQUFHakIsK0NBQVFBLENBQWdCO0lBQ3BFLE1BQU0sQ0FBQ2tCLGlCQUFpQkMsbUJBQW1CLEdBQUduQiwrQ0FBUUEsQ0FBQztJQUN2RCxNQUFNLENBQUNvQixXQUFXQyxhQUFhLEdBQUdyQiwrQ0FBUUEsQ0FBQztJQUMzQyxNQUFNLENBQUNzQixPQUFPQyxTQUFTLEdBQUd2QiwrQ0FBUUEsQ0FBZ0I7SUFFbERDLGdEQUFTQSxDQUFDO1FBQ1J1QjtJQUNGLEdBQUcsRUFBRTtJQUVMLE1BQU1BLGtCQUFrQjtRQUN0QixJQUFJO1lBQ0YsTUFBTUMsV0FBVyxNQUFNQyxNQUFNLHlDQUF5QztnQkFDcEVDLGFBQWE7Z0JBQ2JDLFNBQVM7b0JBQ1AsVUFBVTtnQkFDWjtZQUNGO1lBQ0EsTUFBTUMsT0FBTyxNQUFNSixTQUFTSyxJQUFJO1lBRWhDWCxtQkFBbUJVLEtBQUtFLGFBQWE7WUFDckMsSUFBSUYsS0FBS0UsYUFBYSxFQUFFO2dCQUN0QixNQUFNQyxrQkFBa0IsTUFBTU4sTUFBTSwwQ0FBMEM7b0JBQzVFQyxhQUFhO29CQUNiQyxTQUFTO3dCQUNQLFVBQVU7b0JBQ1o7Z0JBQ0Y7Z0JBQ0EsTUFBTUssY0FBYyxNQUFNRCxnQkFBZ0JGLElBQUk7Z0JBRTlDLElBQUlHLFlBQVlDLE9BQU8sRUFBRTtvQkFDdkJuQixXQUFXa0IsWUFBWXZCLE9BQU87b0JBQzlCLElBQUltQixLQUFLTSxTQUFTLEVBQUU7d0JBQ2xCbEIsa0JBQWtCWSxLQUFLTSxTQUFTO3dCQUNoQzFCLGVBQWVvQixLQUFLTSxTQUFTO29CQUMvQjtnQkFDRixPQUFPO29CQUNMWixTQUFTO2dCQUNYO1lBQ0Y7UUFDRixFQUFFLE9BQU9ELE9BQU87WUFDZGMsUUFBUWQsS0FBSyxDQUFDLCtCQUErQkE7WUFDN0NDLFNBQVM7UUFDWDtJQUNGO0lBRUEsTUFBTWMsY0FBYyxPQUFPQztRQUN6QkEsRUFBRUMsY0FBYztRQUNoQixJQUFJLENBQUM1QixZQUFZLENBQUNFLFVBQVU7WUFDMUJVLFNBQVM7WUFDVDtRQUNGO1FBRUFGLGFBQWE7UUFDYkUsU0FBUztRQUVULElBQUk7WUFDRixNQUFNRSxXQUFXLE1BQU1DLE1BQU0sd0NBQXdDO2dCQUNuRWMsUUFBUTtnQkFDUmIsYUFBYTtnQkFDYkMsU0FBUztvQkFDUCxnQkFBZ0I7b0JBQ2hCLFVBQVU7Z0JBQ1o7Z0JBQ0FhLE1BQU1DLEtBQUtDLFNBQVMsQ0FBQztvQkFBRWhDO29CQUFVRTtnQkFBUztZQUM1QztZQUVBLE1BQU1nQixPQUFPLE1BQU1KLFNBQVNLLElBQUk7WUFFaEMsSUFBSUwsU0FBU21CLEVBQUUsSUFBSWYsS0FBS0ssT0FBTyxFQUFFO2dCQUMvQmYsbUJBQW1CO2dCQUNuQkosV0FBV2MsS0FBS25CLE9BQU8sSUFBSSxFQUFFO2dCQUM3QkksWUFBWSxJQUFJLDhCQUE4Qjs7Z0JBQzlDUyxTQUFTLE1BQU0sNEJBQTRCOztZQUM3QyxPQUFPO2dCQUNMYSxRQUFRZCxLQUFLLENBQUMsaUJBQWlCTztnQkFDL0JOLFNBQVNNLEtBQUtQLEtBQUssSUFBSTtZQUN6QjtRQUNGLEVBQUUsT0FBT0EsT0FBTztZQUNkYyxRQUFRZCxLQUFLLENBQUMsZ0JBQWdCQTtZQUM5QkMsU0FBUztRQUNYLFNBQVU7WUFDUkYsYUFBYTtRQUNmO0lBQ0Y7SUFFQSxNQUFNd0IsZUFBZTtRQUNuQixJQUFJO1lBQ0YsTUFBTXBCLFdBQVcsTUFBTUMsTUFBTSx5Q0FBeUM7Z0JBQ3BFYyxRQUFRO2dCQUNSYixhQUFhO2dCQUNiQyxTQUFTO29CQUNQLFVBQVU7Z0JBQ1o7WUFDRjtZQUVBLElBQUlILFNBQVNtQixFQUFFLEVBQUU7Z0JBQ2Z6QixtQkFBbUI7Z0JBQ25CRixrQkFBa0I7Z0JBQ2xCRixXQUFXLEVBQUU7Z0JBQ2JOLGVBQWU7Z0JBQ2ZHLFlBQVk7Z0JBQ1pFLFlBQVk7WUFDZCxPQUFPO2dCQUNMLE1BQU1lLE9BQU8sTUFBTUosU0FBU0ssSUFBSTtnQkFDaENQLFNBQVNNLEtBQUtQLEtBQUssSUFBSTtZQUN6QjtRQUNGLEVBQUUsT0FBT0EsT0FBTztZQUNkYyxRQUFRZCxLQUFLLENBQUMsc0JBQXNCQTtZQUNwQ0MsU0FBUztRQUNYO0lBQ0Y7SUFFQSxNQUFNdUIscUJBQXFCLE9BQU9DO1FBQ2hDOUIsa0JBQWtCOEI7UUFDbEIsSUFBSTtZQUNGLE1BQU10QixXQUFXLE1BQU1DLE1BQU0sZ0RBQWdEO2dCQUMzRWMsUUFBUTtnQkFDUmIsYUFBYTtnQkFDYkMsU0FBUztvQkFDUCxnQkFBZ0I7b0JBQ2hCLFVBQVU7Z0JBQ1o7Z0JBQ0FhLE1BQU1DLEtBQUtDLFNBQVMsQ0FBQztvQkFBRVIsV0FBV1k7Z0JBQVM7WUFDN0M7WUFDQSxNQUFNbEIsT0FBTyxNQUFNSixTQUFTSyxJQUFJO1lBQ2hDLElBQUlELEtBQUtLLE9BQU8sRUFBRTtnQkFDaEJ6QixlQUFlc0M7WUFDakIsT0FBTztnQkFDTHhCLFNBQVNNLEtBQUtQLEtBQUssSUFBSTtZQUN6QjtRQUNGLEVBQUUsT0FBT0EsT0FBTztZQUNkYyxRQUFRZCxLQUFLLENBQUMsMkJBQTJCQTtZQUN6Q0MsU0FBUztRQUNYO0lBQ0Y7SUFFQSxNQUFNeUIsaUJBQWlCLENBQUNWO1FBQ3RCLElBQUlBLEVBQUVXLEdBQUcsS0FBSyxTQUFTO1lBQ3JCWixZQUFZQztRQUNkO0lBQ0Y7SUFFQSxJQUFJLENBQUNwQixpQkFBaUI7UUFDcEIscUJBQ0UsOERBQUNnQztZQUFJQyxXQUFVO3NCQUNiLDRFQUFDRDtnQkFBSUMsV0FBVTs7a0NBQ2IsOERBQUNoRCx1REFBS0E7d0JBQ0ppRCxNQUFLO3dCQUNMQyxhQUFZO3dCQUNaQyxPQUFPM0M7d0JBQ1A0QyxVQUFVLENBQUNqQixJQUFNMUIsWUFBWTBCLEVBQUVrQixNQUFNLENBQUNGLEtBQUs7d0JBQzNDRyxZQUFZVDt3QkFDWkcsV0FBVTs7Ozs7O2tDQUVaLDhEQUFDaEQsdURBQUtBO3dCQUNKaUQsTUFBSzt3QkFDTEMsYUFBWTt3QkFDWkMsT0FBT3pDO3dCQUNQMEMsVUFBVSxDQUFDakIsSUFBTXhCLFlBQVl3QixFQUFFa0IsTUFBTSxDQUFDRixLQUFLO3dCQUMzQ0csWUFBWVQ7d0JBQ1pHLFdBQVU7Ozs7OztrQ0FFWiw4REFBQ2pELHlEQUFNQTt3QkFDTHdELFNBQVNyQjt3QkFDVHNCLFVBQVV2QyxhQUFhLENBQUNULFlBQVksQ0FBQ0U7d0JBQ3JDc0MsV0FBVTtrQ0FFVC9CLFlBQVksa0JBQWtCOzs7Ozs7b0JBRWhDRSx1QkFBUyw4REFBQzRCO3dCQUFJQyxXQUFVO2tDQUErQjdCOzs7Ozs7Ozs7Ozs7Ozs7OztJQUloRTtJQUVBLHFCQUNFLDhEQUFDNEI7UUFBSUMsV0FBVTs7MEJBQ2IsOERBQUNEO2dCQUFJQyxXQUFVOztrQ0FDYiw4REFBQy9DLHlEQUFNQTt3QkFBQ2tELE9BQU90QyxrQkFBa0I7d0JBQUk0QyxlQUFlZDs7MENBQ2xELDhEQUFDdkMsZ0VBQWFBO2dDQUFDNEMsV0FBVTswQ0FDdEJuQyxpQkFDQ04sRUFBQUEsZ0JBQUFBLFFBQVFtRCxJQUFJLENBQUNDLENBQUFBLElBQUtBLEVBQUVDLEVBQUUsS0FBSy9DLDZCQUEzQk4sb0NBQUFBLGNBQTRDc0QsSUFBSSxLQUFJLGtCQUNsRDs7Ozs7OzBDQUVOLDhEQUFDM0QsZ0VBQWFBOzBDQUNYSyxRQUFRdUQsR0FBRyxDQUFDLENBQUNDLHVCQUNaLDhEQUFDNUQsNkRBQVVBO3dDQUFpQmdELE9BQU9ZLE9BQU9ILEVBQUU7a0RBQ3pDRyxPQUFPRixJQUFJO3VDQURHRSxPQUFPSCxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7O2tDQU1oQyw4REFBQzdELHlEQUFNQTt3QkFDTHdELFNBQVNiO3dCQUNUc0IsU0FBUTt3QkFDUmhCLFdBQVU7a0NBQ1g7Ozs7Ozs7Ozs7OztZQUlGN0Isc0JBQ0MsOERBQUM0QjtnQkFBSUMsV0FBVTswQkFBNkI3Qjs7Ozs7cUNBRTVDLDhEQUFDNEI7Z0JBQUlDLFdBQVU7MEJBQTZCOzs7Ozs7Ozs7Ozs7QUFJcEQ7R0FuTndCM0M7S0FBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2NvbXBvbmVudHMvYXV0aC1oZWFkZXIudHN4P2M2Y2UiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgY2xpZW50XCJcclxuXHJcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xyXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXHJcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJ0AvY29tcG9uZW50cy91aS9idXR0b24nXHJcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnQC9jb21wb25lbnRzL3VpL2lucHV0J1xyXG5pbXBvcnQge1xyXG4gIFNlbGVjdCxcclxuICBTZWxlY3RDb250ZW50LFxyXG4gIFNlbGVjdEl0ZW0sXHJcbiAgU2VsZWN0VHJpZ2dlcixcclxufSBmcm9tICdAL2NvbXBvbmVudHMvdWkvc2VsZWN0J1xyXG5cclxuaW50ZXJmYWNlIExlYWd1ZSB7XHJcbiAgaWQ6IHN0cmluZ1xyXG4gIG5hbWU6IHN0cmluZ1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQXV0aEhlYWRlclByb3BzIHtcclxuICBvbkxlYWd1ZUNoYW5nZTogKGxlYWd1ZUlkOiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEF1dGhIZWFkZXIoeyBvbkxlYWd1ZUNoYW5nZSB9OiBBdXRoSGVhZGVyUHJvcHMpIHtcclxuICBjb25zdCBbdXNlcm5hbWUsIHNldFVzZXJuYW1lXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtwYXNzd29yZCwgc2V0UGFzc3dvcmRdID0gdXNlU3RhdGUoJycpXHJcbiAgY29uc3QgW2xlYWd1ZXMsIHNldExlYWd1ZXNdID0gdXNlU3RhdGU8TGVhZ3VlW10+KFtdKVxyXG4gIGNvbnN0IFtzZWxlY3RlZExlYWd1ZSwgc2V0U2VsZWN0ZWRMZWFndWVdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbaXNBdXRoZW50aWNhdGVkLCBzZXRJc0F1dGhlbnRpY2F0ZWRdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNoZWNrQXV0aFN0YXR1cygpXHJcbiAgfSwgW10pXHJcblxyXG4gIGNvbnN0IGNoZWNrQXV0aFN0YXR1cyA9IGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9hcGkvYXV0aC9zdGF0dXMnLCB7XHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG5cclxuICAgICAgc2V0SXNBdXRoZW50aWNhdGVkKGRhdGEuYXV0aGVudGljYXRlZClcclxuICAgICAgaWYgKGRhdGEuYXV0aGVudGljYXRlZCkge1xyXG4gICAgICAgIGNvbnN0IGxlYWd1ZXNSZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwOi8vbG9jYWxob3N0OjUwMDAvYXBpL2F1dGgvbGVhZ3VlcycsIHtcclxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBsZWFndWVzRGF0YSA9IGF3YWl0IGxlYWd1ZXNSZXNwb25zZS5qc29uKClcclxuICAgICAgICBcclxuICAgICAgICBpZiAobGVhZ3Vlc0RhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgICAgc2V0TGVhZ3VlcyhsZWFndWVzRGF0YS5sZWFndWVzKVxyXG4gICAgICAgICAgaWYgKGRhdGEubGVhZ3VlX2lkKSB7XHJcbiAgICAgICAgICAgIHNldFNlbGVjdGVkTGVhZ3VlKGRhdGEubGVhZ3VlX2lkKVxyXG4gICAgICAgICAgICBvbkxlYWd1ZUNoYW5nZShkYXRhLmxlYWd1ZV9pZClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBsZWFndWVzJylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIGF1dGggc3RhdHVzOicsIGVycm9yKVxyXG4gICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGNoZWNrIGF1dGhlbnRpY2F0aW9uIHN0YXR1cycpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBoYW5kbGVMb2dpbiA9IGFzeW5jIChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIGlmICghdXNlcm5hbWUgfHwgIXBhc3N3b3JkKSB7XHJcbiAgICAgIHNldEVycm9yKCdVc2VybmFtZSBhbmQgcGFzc3dvcmQgYXJlIHJlcXVpcmVkJylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0SXNMb2FkaW5nKHRydWUpXHJcbiAgICBzZXRFcnJvcihudWxsKVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9hcGkvYXV0aC9sb2dpbicsIHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQgfSlcclxuICAgICAgfSlcclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcclxuICAgICAgXHJcbiAgICAgIGlmIChyZXNwb25zZS5vayAmJiBkYXRhLnN1Y2Nlc3MpIHtcclxuICAgICAgICBzZXRJc0F1dGhlbnRpY2F0ZWQodHJ1ZSlcclxuICAgICAgICBzZXRMZWFndWVzKGRhdGEubGVhZ3VlcyB8fCBbXSlcclxuICAgICAgICBzZXRQYXNzd29yZCgnJykgLy8gQ2xlYXIgcGFzc3dvcmQgZm9yIHNlY3VyaXR5XHJcbiAgICAgICAgc2V0RXJyb3IobnVsbCkgLy8gQ2xlYXIgYW55IHByZXZpb3VzIGVycm9yc1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xvZ2luIGZhaWxlZDonLCBkYXRhKVxyXG4gICAgICAgIHNldEVycm9yKGRhdGEuZXJyb3IgfHwgJ0xvZ2luIGZhaWxlZC4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuJylcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignTG9naW4gZXJyb3I6JywgZXJyb3IpXHJcbiAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gY29ubmVjdCB0byBzZXJ2ZXIuIFBsZWFzZSB0cnkgYWdhaW4uJylcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldElzTG9hZGluZyhmYWxzZSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGhhbmRsZUxvZ291dCA9IGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9hcGkvYXV0aC9sb2dvdXQnLCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgXHJcbiAgICAgIGlmIChyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHNldElzQXV0aGVudGljYXRlZChmYWxzZSlcclxuICAgICAgICBzZXRTZWxlY3RlZExlYWd1ZShudWxsKVxyXG4gICAgICAgIHNldExlYWd1ZXMoW10pXHJcbiAgICAgICAgb25MZWFndWVDaGFuZ2UobnVsbClcclxuICAgICAgICBzZXRVc2VybmFtZSgnJylcclxuICAgICAgICBzZXRQYXNzd29yZCgnJylcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXHJcbiAgICAgICAgc2V0RXJyb3IoZGF0YS5lcnJvciB8fCAnRmFpbGVkIHRvIGxvZ291dCcpXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGxvZ2dpbmcgb3V0OicsIGVycm9yKVxyXG4gICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGxvZ291dCcpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBoYW5kbGVMZWFndWVDaGFuZ2UgPSBhc3luYyAobGVhZ3VlSWQ6IHN0cmluZykgPT4ge1xyXG4gICAgc2V0U2VsZWN0ZWRMZWFndWUobGVhZ3VlSWQpXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwOi8vbG9jYWxob3N0OjUwMDAvYXBpL2F1dGgvc2VsZWN0LWxlYWd1ZScsIHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBsZWFndWVfaWQ6IGxlYWd1ZUlkIH0pXHJcbiAgICAgIH0pXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcclxuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgIG9uTGVhZ3VlQ2hhbmdlKGxlYWd1ZUlkKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNldEVycm9yKGRhdGEuZXJyb3IgfHwgJ0ZhaWxlZCB0byBzZWxlY3QgbGVhZ3VlJylcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2VsZWN0aW5nIGxlYWd1ZTonLCBlcnJvcilcclxuICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBzZWxlY3QgbGVhZ3VlJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGhhbmRsZUtleVByZXNzID0gKGU6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcclxuICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG4gICAgICBoYW5kbGVMb2dpbihlIGFzIHVua25vd24gYXMgUmVhY3QuTW91c2VFdmVudClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICghaXNBdXRoZW50aWNhdGVkKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWdyYXktODAwLzUwIHJvdW5kZWQtbGcgcC00IG1iLThcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGdhcC00IGl0ZW1zLWNlbnRlclwiPlxyXG4gICAgICAgICAgPElucHV0XHJcbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJNRkwgVXNlcm5hbWVcIlxyXG4gICAgICAgICAgICB2YWx1ZT17dXNlcm5hbWV9XHJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VXNlcm5hbWUoZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICBvbktleVByZXNzPXtoYW5kbGVLZXlQcmVzc31cclxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIG1pbi13LVsyMDBweF1cIlxyXG4gICAgICAgICAgLz5cclxuICAgICAgICAgIDxJbnB1dFxyXG4gICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlBhc3N3b3JkXCJcclxuICAgICAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxyXG4gICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFBhc3N3b3JkKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgb25LZXlQcmVzcz17aGFuZGxlS2V5UHJlc3N9XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBtaW4tdy1bMjAwcHhdXCJcclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgICA8QnV0dG9uIFxyXG4gICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVMb2dpbn1cclxuICAgICAgICAgICAgZGlzYWJsZWQ9e2lzTG9hZGluZyB8fCAhdXNlcm5hbWUgfHwgIXBhc3N3b3JkfVxyXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJiZy1ibHVlLTYwMCBob3ZlcjpiZy1ibHVlLTcwMCB3LWZ1bGwgc206dy1hdXRvXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAge2lzTG9hZGluZyA/ICdMb2dnaW5nIGluLi4uJyA6ICdMb2dpbiB3aXRoIE1GTCd9XHJcbiAgICAgICAgICA8L0J1dHRvbj5cclxuICAgICAgICAgIHtlcnJvciAmJiA8ZGl2IGNsYXNzTmFtZT1cInRleHQtcmVkLTQwMCB0ZXh0LXNtIHctZnVsbFwiPntlcnJvcn08L2Rpdj59XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctZ3JheS04MDAvNTAgcm91bmRlZC1sZyBwLTQgbWItOFwiPlxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGdhcC00IGl0ZW1zLWNlbnRlclwiPlxyXG4gICAgICAgIDxTZWxlY3QgdmFsdWU9e3NlbGVjdGVkTGVhZ3VlIHx8ICcnfSBvblZhbHVlQ2hhbmdlPXtoYW5kbGVMZWFndWVDaGFuZ2V9PlxyXG4gICAgICAgICAgPFNlbGVjdFRyaWdnZXIgY2xhc3NOYW1lPVwiZmxleC0xIG1pbi13LVsyMDBweF1cIj5cclxuICAgICAgICAgICAge3NlbGVjdGVkTGVhZ3VlID8gXHJcbiAgICAgICAgICAgICAgbGVhZ3Vlcy5maW5kKGwgPT4gbC5pZCA9PT0gc2VsZWN0ZWRMZWFndWUpPy5uYW1lIHx8ICdTZWxlY3QgTGVhZ3VlJyBcclxuICAgICAgICAgICAgICA6ICdTZWxlY3QgTGVhZ3VlJ31cclxuICAgICAgICAgIDwvU2VsZWN0VHJpZ2dlcj5cclxuICAgICAgICAgIDxTZWxlY3RDb250ZW50PlxyXG4gICAgICAgICAgICB7bGVhZ3Vlcy5tYXAoKGxlYWd1ZSkgPT4gKFxyXG4gICAgICAgICAgICAgIDxTZWxlY3RJdGVtIGtleT17bGVhZ3VlLmlkfSB2YWx1ZT17bGVhZ3VlLmlkfT5cclxuICAgICAgICAgICAgICAgIHtsZWFndWUubmFtZX1cclxuICAgICAgICAgICAgICA8L1NlbGVjdEl0ZW0+XHJcbiAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgPC9TZWxlY3RDb250ZW50PlxyXG4gICAgICAgIDwvU2VsZWN0PlxyXG4gICAgICAgIDxCdXR0b24gXHJcbiAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVMb2dvdXR9XHJcbiAgICAgICAgICB2YXJpYW50PVwib3V0bGluZVwiXHJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgc206dy1hdXRvXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICBMb2dvdXRcclxuICAgICAgICA8L0J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIHtlcnJvciA/IChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtcmVkLTQwMCB0ZXh0LXNtIG10LTJcIj57ZXJyb3J9PC9kaXY+XHJcbiAgICAgICkgOiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWdyYXktMTAwIHRleHQtc20gbXQtMlwiPlN1Y2Nlc3NmdWxseSBsb2dnZWQgaW48L2Rpdj5cclxuICAgICAgKX1cclxuICAgIDwvZGl2PlxyXG4gIClcclxufSAiXSwibmFtZXMiOlsiUmVhY3QiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsIkJ1dHRvbiIsIklucHV0IiwiU2VsZWN0IiwiU2VsZWN0Q29udGVudCIsIlNlbGVjdEl0ZW0iLCJTZWxlY3RUcmlnZ2VyIiwiQXV0aEhlYWRlciIsIm9uTGVhZ3VlQ2hhbmdlIiwibGVhZ3VlcyIsInVzZXJuYW1lIiwic2V0VXNlcm5hbWUiLCJwYXNzd29yZCIsInNldFBhc3N3b3JkIiwic2V0TGVhZ3VlcyIsInNlbGVjdGVkTGVhZ3VlIiwic2V0U2VsZWN0ZWRMZWFndWUiLCJpc0F1dGhlbnRpY2F0ZWQiLCJzZXRJc0F1dGhlbnRpY2F0ZWQiLCJpc0xvYWRpbmciLCJzZXRJc0xvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwiY2hlY2tBdXRoU3RhdHVzIiwicmVzcG9uc2UiLCJmZXRjaCIsImNyZWRlbnRpYWxzIiwiaGVhZGVycyIsImRhdGEiLCJqc29uIiwiYXV0aGVudGljYXRlZCIsImxlYWd1ZXNSZXNwb25zZSIsImxlYWd1ZXNEYXRhIiwic3VjY2VzcyIsImxlYWd1ZV9pZCIsImNvbnNvbGUiLCJoYW5kbGVMb2dpbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsIm1ldGhvZCIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5Iiwib2siLCJoYW5kbGVMb2dvdXQiLCJoYW5kbGVMZWFndWVDaGFuZ2UiLCJsZWFndWVJZCIsImhhbmRsZUtleVByZXNzIiwia2V5IiwiZGl2IiwiY2xhc3NOYW1lIiwidHlwZSIsInBsYWNlaG9sZGVyIiwidmFsdWUiLCJvbkNoYW5nZSIsInRhcmdldCIsIm9uS2V5UHJlc3MiLCJvbkNsaWNrIiwiZGlzYWJsZWQiLCJvblZhbHVlQ2hhbmdlIiwiZmluZCIsImwiLCJpZCIsIm5hbWUiLCJtYXAiLCJsZWFndWUiLCJ2YXJpYW50Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/auth-header.tsx\n"));

/***/ })

});