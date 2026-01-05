'use client';

import  { BackgroundPaths } from "@/components/ui/shadcn-io/background-paths";

import { HeroTitle } from "@/components/ui/HeroTitle";
import { HeroSubtitle } from "@/components/ui/HeroSubtitle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Navbar } from "@/components/ui/Navbar";
import { AboutMe } from "@/components/ui/AboutMe";
import { Skills } from "@/components/ui/Skills";

import { PROFILE_PHOTO_LINK } from "@/constants/links";

export const Home = () => {
  return ( 
  <div className="relative min-h-screen">

	{/* Background */}
	<div className="fixed inset-0 -z-10 pointer-events-none">
	  <BackgroundPaths />
	</div>

	{/* Foreground */}
	<div className="relative z-10">

	  {/* Hero Section */}
	  <section id="hero" className="relative h-screen w-full">
		<div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex items-center">
		  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

			{/* Title (LEFT) */}
			<div className="text-center md:text-left flex-col items-center md:items-start flex">
			  <HeroTitle title="ANDRE GISKE" />

			  {/* Subtitle */}
			  <div className="mb-6">
				<div className="font-medium text-lg sm:text-xl md:text-2xl">
				  <HeroSubtitle subtitle="CSE Student & AI/ML Enthusiast"/>
				</div>
			  </div>
		    </div>

		    {/* Photo (RIGHT) */}
		    <div className="flex md:justify-end justify-center">
			  <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-88 lg:h-88 rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg">
				<img
			      src={PROFILE_PHOTO_LINK}
				  alt="Andre Giske"
				  className="w-full h-full object-cover"
				/>
			  </div>
			</div>
		  </div>
		</div>
	  </section>

	  {/* Theme Toggle */}
	  <ThemeToggle />

	  {/* Navbar */}
	  <Navbar />

	  <main>

		{/* Main Content */}
		<AboutMe />

		<Skills />

	  </main>

	  {/* Footer */}

	</div>
  </div>
  );
};