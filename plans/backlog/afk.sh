#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  result=$(docker sandbox run --credentials host claude -p "@progress.txt @plans/backlog/prompt.md \
  Once you've completed your task, run gh issue list again to check the status of the issues. \
  Some issues may have been added while you were working on your task. 
  If there is nothing to do, output <promise>COMPLETE</promise>.")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete after $i iterations."
    tt notify "Course Builder PRD Complete"
    exit 0
  fi
done
