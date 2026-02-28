#!/usr/bin/env bash
# import-all.sh — Import all maintAIn tools and agent into watsonx Orchestrate
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Importing maintAIn tools ==="

echo "[1/5] Importing get_burnout_status..."
orchestrate tools import -k python -f "$SCRIPT_DIR/tools/get_burnout_status.py"

echo "[2/5] Importing get_study_plan..."
orchestrate tools import -k python -f "$SCRIPT_DIR/tools/get_study_plan.py"

echo "[3/5] Importing get_deadlines..."
orchestrate tools import -k python -f "$SCRIPT_DIR/tools/get_deadlines.py"

echo "[4/5] Importing get_weekly_digest..."
orchestrate tools import -k python -f "$SCRIPT_DIR/tools/get_weekly_digest.py"

echo "[5/5] Importing get_course_stats..."
orchestrate tools import -k python -f "$SCRIPT_DIR/tools/get_course_stats.py"

echo ""
echo "=== Importing maintAIn agent ==="
orchestrate agents import -f "$SCRIPT_DIR/agents/maintain_agent.yaml"

echo ""
echo "=== Done! Verifying... ==="
echo ""
echo "--- Tools ---"
orchestrate tools list
echo ""
echo "--- Agents ---"
orchestrate agents list
echo ""
echo "Agent deployed! Test it at https://dl.watson-orchestrate.ibm.com"
