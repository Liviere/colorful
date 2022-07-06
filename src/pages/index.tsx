import { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import ReinventedColorWheel from 'reinvented-color-wheel';
import 'reinvented-color-wheel/css/reinvented-color-wheel.min.css';

import { useEffectOnce } from 'hooks/useEffectOnce';
import { ColorPalette, Orb } from 'util/classes';
import { debounce } from 'util/debounce';

const Home: NextPage = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const palleteRef = useRef<ColorPalette>();
	const orbsRef = useRef<Orb[]>();
	const whellObjectRef = useRef<any>(null);
	const wheelElementRef = useRef<HTMLDivElement>(null);
	const [hsl, setHsl] = useState<[number, number, number]>([0, 100, 50]);

	useEffectOnce(() => {
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

				const app = new Application({
					// render to <canvas class="orb-canvas"></canvas>
					view: canvasRef.current,
					// auto adjust size to fit the current window
					resizeTo: window,
					// transparent background, we will be creating a gradient background later using CSS
					transparent: true,
				});

				for (let i = 0; i < 10; i++) {
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
		})();
	});

	useEffectOnce(() => {
		if (wheelElementRef.current) {
			const colorWheel = new ReinventedColorWheel({
				// appendTo is the only required property. specify the parent element of the color wheel.
				appendTo: wheelElementRef.current,

				// followings are optional properties and their default values.

				// initial color (can be specified in hsv / hsl / rgb / hex)
				// hsv: [0, 100, 100],
				hsl: hsl,
				// rgb: [255, 0, 0],
				// hex: "#ff0000",

				// appearance
				wheelDiameter: 20,
				wheelThickness: 20,
				handleDiameter: 16,
				wheelReflectsSaturation: true,

				// handler
				onChange: function (color) {
					setHsl([...color.hsl]);
				},
			});

			whellObjectRef.current = colorWheel;
			// set color in HSV / HSL / RGB / HEX
			colorWheel.hsl = [120, 100, 50];

			// get color in HSV / HSL / RGB / HEX

			// please call redraw() after changing some appearance properties.
			colorWheel.wheelDiameter = 400;
			colorWheel.wheelThickness = 40;
			colorWheel.redraw();
		}
	});

	useEffect(() => {
		// the only argument is the ReinventedColorWheel instance itself.
		document.documentElement.style.setProperty(
			'--hue',
			// @ts-ignore
			hsl[0]
		);
		document.documentElement.style.setProperty(
			'--saturation',
			// @ts-ignore
			`${hsl[1]}%`
		);
		document.documentElement.style.setProperty(
			'--lightness',
			// @ts-ignore
			`${hsl[2]}%`
		);

		if (palleteRef.current)
			debounce(
				() => {
					palleteRef.current?.setColors(hsl[0]);
					orbsRef.current?.forEach((orb) => {
						orb.fill = palleteRef.current?.randomColor();
					});
				},
				100,
				'setColors'
			);
		whellObjectRef.current.hsl = hsl;
		whellObjectRef.current.redraw();
	}, [hsl]);

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
						This is a <span className="text-gradient">generative</span> UI
						example.
					</h1>
					{/* <!-- Description --> */}
					<p className="overlay__description">
						A generative “orb” animation is made with{' '}
						<a href="https://pixijs.com/">pixi.js</a> engine. You can change the
						current color using the color wheel or with a randomizing button.
						<br />
						<strong> Have fun!</strong>
					</p>
					{/* <!-- Buttons --> */}
					<div className="overlay__btns"></div>

					<div className="color-wheel-container">
						<div ref={wheelElementRef} />
					</div>
					<button
						className="overlay__btn overlay__btn--colors"
						onClick={() => {
							if (palleteRef.current && orbsRef.current) {
								palleteRef.current;
								const hue = palleteRef.current.getRandomColor();
								setHsl([hue, hsl[1], hsl[2]]);
							}
						}}
					>
						<span>Randomise Colors</span>
						<span className="overlay__btn-emoji">🎨</span>
					</button>
				</div>
			</main>
			<canvas ref={canvasRef} className="orb-canvas"></canvas>
		</div>
	);
};

export default Home;
