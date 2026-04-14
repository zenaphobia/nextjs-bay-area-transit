/* eslint-disable import/no-anonymous-default-export */
/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(req, env) {
		const country = req.cf?.country;

		if (country !== 'US') {
			return new Response(null, { status: 404 });
		}

		const url = new URL(req.url);
		const type = url.searchParams.get('type');
		const API_KEY = env.API_KEY;

		if (type === 'trams') {
			const TRAMS_URL = new URL(`http://api.511.org/transit/tripupdates?api_key=${API_KEY}&agency=BA`);
			const TRANSIT_TRAM_KEY = 'transit_trams';
			const tram_cache = await env.TRANSIT_KV.get(TRANSIT_TRAM_KEY, 'arrayBuffer');

			if (tram_cache) {
				console.info('Getting cache hit');
				return new Response(tram_cache, {
					headers: {
						'Content-Type': 'application/octet-stream',
						'Cache-Control': 'public, max-age=60',
						'Access-Control-Allow-Origin': '*',
					},
				});
			}

			try {
				const buffer = await fetchAndSetData(TRAMS_URL, TRANSIT_TRAM_KEY, 'gtfs');
				return new Response(buffer, {
					headers: {
						'Content-Type': 'application/octet-stream',
						'Cache-Control': 'public, max-age=60',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (err) {
				console.error(`Failed to fetch response from '${type}' url. Error: ${err.message}`);
				return new Response(JSON.stringify({ error: 'Failed to fetch response' }), {
					status: 502,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		} else if (type === 'stops') {
			const STOPS_URL = new URL(`https://api.511.org/transit/stops?api_key=${API_KEY}&operator_id=BA&format=json`);
			const TRANSIT_STOPS_KEY = 'transit_stops';
			const stops_cache = await env.TRANSIT_KV.get(TRANSIT_STOPS_KEY);

			if (stops_cache) {
				console.info('Getting cache hit');
				return new Response(stops_cache, {
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'public, max-age=60',
						'Access-Control-Allow-Origin': '*',
					},
				});
			}

			try {
				const buffer = await fetchAndSetData(STOPS_URL, TRANSIT_STOPS_KEY, 'json');
				return new Response(buffer, {
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'public, max-age=60',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (err) {
				console.error(`Failed to fetch response from '${type}' url. Error: ${err.message}`);
				return new Response(JSON.stringify({ error: 'Failed to fetch response' }), {
					status: 502,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		} else {
			return new Response('Invalid type', { status: 404 });
		}

		async function fetchAndSetData(url, key, type) {
			if (url === undefined) throw new Error('URL is missing');

			const res = await fetch(url);

			if (!res.ok) {
				throw new Error(`Failed to fetch from: ${url}`);
			}

			const data = type === 'gtfs' ? await res.arrayBuffer() : JSON.stringify(await res.json());
			await env.TRANSIT_KV.put(key, data);
			return data;
		}
	},

	async scheduled(event, env, ctx) {
		const API_KEY = env.API_KEY;
		const TRAMS_URL = new URL(`http://api.511.org/transit/tripupdates?api_key=${API_KEY}&agency=BA`);
		const TRANSIT_TRAM_KEY = 'transit_trams';

		const res = await fetch(TRAMS_URL);

		if (res.ok) {
			const data = await res.arrayBuffer();
			await env.TRANSIT_KV.put(TRANSIT_TRAM_KEY, data);
		} else {
			console.error('Error fetching from 511 API');
		}
	},
};
