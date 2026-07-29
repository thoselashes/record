import { onRequestGet as __api_appointments_js_onRequestGet } from "C:\\Projects\\thoselashes-admin\\functions\\api\\appointments.js"
import { onRequestPost as __api_submit_js_onRequestPost } from "C:\\Projects\\thoselashes-admin\\functions\\api\\submit.js"

export const routes = [
    {
      routePath: "/api/appointments",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_appointments_js_onRequestGet],
    },
  {
      routePath: "/api/submit",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_submit_js_onRequestPost],
    },
  ]