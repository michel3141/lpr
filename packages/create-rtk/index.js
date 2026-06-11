#!/usr/bin/env node

import { Command } from "commander";
import { createProject } from "./lib/createProject.js";

const program = new Command();

program
  .name("create-rtk")
  .argument("<sliceName>")
  .option("--init", "initialise le projet")
  .option("-r, --react", "react mode")
  .option("-v, --verbose", "verbose output")
  .action((sliceName, options) => {
    createProject( sliceName, options );
  });

program.parse();
