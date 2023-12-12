import { CPage, _ } from "../../../cwx/cwx.js";
import index from "./revealPage/index.js";

CPage(
	Object.assign(
		{
			source: "wifi-landing",
		},
		{ ...index }
	)
);