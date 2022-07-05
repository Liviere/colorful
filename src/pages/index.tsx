import { useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { ColorPalette, Orb } from 'util/classes';

const Home: NextPage = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const palleteRef = useRef<ColorPalette>();
	const orbsRef = useRef<Orb[]>();

	useEffect(() => {
		// Create orbs
		const orbs: Orb[] = [];
		const colorPalette = new ColorPalette();
		orbsRef.current = orbs;
		palleteRef.current = colorPalette;

		(async () => {
			if (canvasRef.current) {
				const Application = (await import('pixi.js')).Application;
				const Graphics = (await import('pixi.js')).Graphics;
				const Blur = (await import('@pixi/filter-kawase-blur'))
					.KawaseBlurFilter;

				const gf = new Graphics();

				// @ts-ignore
				const app = new Application({
					// render to <canvas class="orb-canvas"></canvas>
					view: canvasRef.current,
					// auto adjust size to fit the current window
					resizeTo: window,
					// transparent background, we will be creating a gradient background later using CSS
					transparent: true,
				});

				for (let i = 0; i < 3; i++) {
					// each orb will be black, just for now
					const orb = new Orb(gf, colorPalette.randomColor());
					app.stage.addChild(orb.graphics);
					app.stage.filters = [new Blur(30, 10, true)];

					orbs.push(orb);
				}

				// Animate!
				if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
					app.ticker.add(() => {
						// update and render each orb, each frame. app.ticker attempts to run at 60fps
						orbs.forEach((orb) => {
							orb.update();
							orb.render();
						});
					});
				} else {
					// perform one update and render per orb, do not animate
					orbs.forEach((orb) => {
						orb.update();
						orb.render();
					});
				}
			}
		})().then(() => console.log('done'));
	}, []);
	return (
		<div>
			<Head>
				<title>Colorful App</title>
				<meta name="description" content="Example of generative landing page" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className="overlay">
				{/* <!-- Overlay inner wrapper --> */}
				<div className="overlay__inner">
					{/* <!-- Title --> */}
					<h1 className="overlay__title">
						Hey, would you like to learn how to create a{' '}
						<span className="text-gradient">generative</span> UI just like this?
					</h1>
					{/* <!-- Description --> */}
					<p className="overlay__description">
						In this tutorial we will be creating a generative “orb” animation
						using pixi.js, picking some lovely random colors, and pulling it all
						together in a nice frosty UI.
						<strong>We&apos;re gonna talk accessibility, too.</strong>
					</p>
					{/* <!-- Buttons --> */}
					<div className="overlay__btns">
						<button className="overlay__btn overlay__btn--transparent">
							Tutorial out Feb 2, 2021
						</button>
						<button
							className="overlay__btn overlay__btn--colors"
							onClick={() => {
								if (palleteRef.current && orbsRef.current) {
									const pallete = palleteRef.current;
									pallete.setColors();
									pallete.setCustomProperties();

									orbsRef.current.forEach((orb) => {
										orb.fill = pallete.randomColor();
									});
								}
							}}
						>
							<span>Randomise Colors</span>
							<span className="overlay__btn-emoji">🎨</span>
						</button>
					</div>
				</div>
			</main>

			<canvas ref={canvasRef} className="orb-canvas"></canvas>
		</div>
	);
};

export default Home;
