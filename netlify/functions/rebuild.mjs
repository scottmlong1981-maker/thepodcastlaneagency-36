// ---------------------------------------------------------------------------
// Scheduled function: pokes a Netlify build hook once a day so the site picks up
// any new YouTube episodes. The build itself is what actually syncs the feed
// (see scripts/sync-episodes.mjs, wired to the "prebuild" npm script).
//
// Requires one environment variable in Netlify:
//   BUILD_HOOK_URL  - Site settings > Build & deploy > Build hooks > Add build hook
//
// Without it, this logs and does nothing, so a missing variable is harmless.
// ---------------------------------------------------------------------------

export default async () => {
  const hook = process.env.BUILD_HOOK_URL;

  if (!hook) {
    console.log('No BUILD_HOOK_URL set; skipping the scheduled rebuild.');
    return new Response('skipped', { status: 200 });
  }

  try {
    const response = await fetch(hook, { method: 'POST' });
    if (!response.ok) throw new Error(`Build hook returned ${response.status}`);
    console.log('Rebuild triggered.');
    return new Response('triggered', { status: 200 });
  } catch (error) {
    console.error(`Could not trigger the rebuild: ${error.message}`);
    return new Response('failed', { status: 500 });
  }
};

// 13:00 UTC daily. Adjust the cron expression to suit your publishing schedule.
export const config = { schedule: '0 13 * * *' };
