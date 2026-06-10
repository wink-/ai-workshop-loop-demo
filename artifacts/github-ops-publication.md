● GitHub Ops: publication path

  github-ops orchestrates the full publication pipeline using gh CLI and Copilot:

   1. Create repo — gh repo create initialises a new GitHub repository with the correct visibility
  and description.
   2. Push main — commits and pushes the generated site source to the main branch.
   3. Enable Pages via Actions — configures GitHub Pages to deploy from the gh-pages environment
  using a GitHub Actions workflow (actions/deploy-pages).
   4. Monitor deploy job — polls the Actions run with gh run watch until the pages build and
  deployment job reaches a terminal state.
   5. Report live URL & status — extracts the published URL from the Pages API (gh api
  repos/{owner}/{repo}/pages) and surfaces the deployment status, commit SHA, and timestamp as
  evidence.

