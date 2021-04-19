import * as shell from "shelljs";

shell.cp("-R", "src/locales/", "dist/locales/");
shell.cp("-R", "src/views/*.ejs", "dist/views/");
