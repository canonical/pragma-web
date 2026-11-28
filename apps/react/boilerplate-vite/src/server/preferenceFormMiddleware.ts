import express, { type RequestHandler } from "express";
import handlePreferenceForm, {
  PREFERENCE_FORM_PATHS,
} from "./handlePreferenceForm.js";

const parseForm = express.urlencoded({ extended: false });

/**
 * Express middleware answering the theme and language forms, which post to
 * `/preferences` and `/language` when JavaScript is off. Any other request
 * passes through.
 */
const preferenceFormMiddleware: RequestHandler = (req, res, next) => {
  if (req.method !== "POST" || !PREFERENCE_FORM_PATHS.has(req.path)) {
    next();
    return;
  }

  parseForm(req, res, (error?: unknown) => {
    if (error) {
      next(error);
      return;
    }

    const answer = handlePreferenceForm({
      pathname: req.path,
      form: new URLSearchParams(req.body as Record<string, string>),
      referer: req.get("referer"),
      origin: `${req.protocol}://${req.get("host")}`,
    });

    if (!answer) {
      next();
      return;
    }

    if (answer.setCookie) res.setHeader("set-cookie", answer.setCookie);
    res.redirect(answer.status, answer.location);
  });
};

export default preferenceFormMiddleware;
