#!/bin/bash

docker sandbox run --credentials host claude --allow-dangerously-skip-permissions "@progress.txt @plans/backlog/prompt.md"
