function buildCredits() {
	const creditsList = document.getElementById("creditsList");

	const credits = [
		// Developers
		{
			name: "AngelBruni",
			role: "main-developer",
			quote: "Five. Hundred. Geckiums.",
			contributions: "y e s.",
			socials: [
				{
					name: gSettingsBundle.GetStringFromName("donateTo"),
					url: "https://ko-fi.com/angelbruni"
				},
				{
					name: "GitHub",
					url: "https://github.com/angelbruni"
				}
			]
		},
		{
			name: "That Linux Dude Dominic Hayes",
			role: "developer",
			quote: "Again, how did this happen? First it was Silverfox, now it's Geckium that I become a main developer for. Ah well, I hope my long list of contributions contributes to your enjoyment of Geckium. Anyway, did you know ka kah and KACᔑᓵリᓵリ↸リᓭʖ?",
			contributions: `A LOT, including the Geckium logo, Geckium You, System Themes, Titlebar Styles, the Themes page in Settings, and much more. See https://github.com/angelbruni/Geckium/commits/main/?author=dominichayesferen and Pull Request !5 for all other Geckium contributions.
Research: Source-accurate GTK+ System Theme, Incognito tinting, ALL the known behaviour differences in every Linux Chromium release, Mac OS X's System Theme (1-5), Chrome Theme metadata, and misc. minor details.
Commits for one merge request: 227 and counting :p`,
			socials: [
				{
					name: gSettingsBundle.GetStringFromName("donateTo"),
					url: "https://patreon.com/dominichayesferen"
				},
				{
					name: "GitHub",
					url: "https://github.com/dominichayesferen"
				}
			]
		},
		{
			name: "Doot",
			role: "developer",
			quote: "door",
			contributions: `Full JS port of Chromium's official colour modification functions, mainly Chromium's colour tinter.
Research: (with the help of Dominic) Chromium's colour tinting code.`,
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/dominichayesferen"
				}
			]
		},

		// JavaScript Loader
		{
			name: "MrOtherGuy",
			role: "js-loader",
			contributions: "Geckium is loaded thanks to this project!",
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/MrOtherGuy/fx-autoconfig"
				}
			]
		},

		// Testers
		{
			name: "florin",
			role: "tester",
			importantText: "The creator of Silverfox, Geckium's spiritual predecessor",
			quote: "Hello as the CEO of Silverfox Enterprises, I approve this project.",
			contributions: `Localised Geckium for Romanian users, and tested prerelease Geckium builds.
Research: Useful insight into Firefox JS.`,
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/florinsdistortedvision"
				}
			]
		},
		{
			name: "ImSwordQueen",
			role: "tester",
			quote: "Meow :3c",
			contributions: "Collaborated with Dominic to desaturate the Geckium logo, and tested pre-release Geckium builds before anyone else.",
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/imswordqueen"
				}
			]
		},
		{
			name: "kwan-vini",
			role: "tester",
			quote: "Ooh, whatcha say? Mm, that you only meant well? Well, of course you did.",
			contributions: "Localised Geckium for Brazillian Portuguese users, created Geckium-tan and its official themes, made multiple Firefox themes with Geckium support in mind, and tested pre-release Geckium builds.",
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/kwan-vini"
				}
			]
		},
		{
			name: "chronail",
			role: "tester",
			quote: "i love sapphire plugin",
			contributions: "Made multiple Firefox themes with Geckium in mind, and tested pre-release Geckium builds."
		},
		{
			name: "addictedtree",
			role: "tester",
			quote: "I'm struggling to fix my sleep schedule help",
			contributions: "Localised Geckium for French users, and tested pre-release Geckium builds."
		},
		{
			name: "luisl",
			role: "tester",
			quote: "que rico pe causita",
			contributions: "Localised Geckium for Spanish users, and tested pre-release Geckium builds.",
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/luisl173"
				}
			]
		},
		{
			name: "Longhorn004",
			role: "tester",
			contributions: "Localised Geckium for Korean and Thai users, and tested pre-release Geckium builds.",
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/Longhorn004"
				}
			]
		},
		{
			name: "pswin56",
			role: "tester",
			quote: "who up gecking their gecks",
			contributions: "Localised Geckium for Spanish users, and tested pre-release Geckium builds.",
			socials: [
				{
					name: "GitGud",
					url: "https://gitgud.io/catpswin56/"
				}
			]
		},
		{
			name: "brawllux",
			role: "tester",
			quote: "Benim adım Yoshikage Kira. Ben 33 yıllar eskisiyim. (sniff) Benim evim kuzeydoğu seksiyonunun içindenin Morioh'nun nerede tüm villalar ve ben değilim evli. Ben çalışıyorum olarak bir eleman için Kame Yu mağazaları ve ben ev alıyorum her gün tarafından 8 PM in the en sonunda. Ben içmiyorum sigara, ve ama ben (clears throat) bazen içiyorum. Ben içindeyim yatağın tarafından 11 PM ve yatıyorum emin ben alıyorum sekiz saat verimli uykusu, hayır fark etmez ne. Sonra elde etmektenin ılık sütü ve yapıyorum bu-u (stutters) hakkında yirmi dakikaların (coughs intensely) genişletmelere önce gitmek yatak ve ben genelde etmek (awkward silence - inhales deeply) hayır problemler uyuyorum kadar sabaha sadece beğenmek bebek, ben uyanıyorum yukarı dışarıya hiç yorgunluk ya da stres içinde sabahın. Bende söyledi buradaydı hayır sorunlarda benim son teftişimde.",
			contributions: "Localised Geckium for Turkish users, and tested pre-release Geckium builds."
		},
		{
			name: "Jimkoutso",
			role: "tester",
			quote: "I'm geck-maxxing",
			contributions: "Nearly accidentally spoiled Chromium Theme support, and tested pre-release Geckium builds.",
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/jimkoutso2008"
				}
			]
		},
		{
			name: "minguinmyoui",
			role: "tester",
			quote: "she geck on my userchrome till I Add a LICENSE",
			contributions: "Tested pre-release Geckium builds.",
			socials: [
				{
					name: "GitHub",
					url: "https://github.com/minguinmyoui"
				}
			]
		},
		{
			name: "DarioPlay",
			role: "tester",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "Shredder",
			role: "tester",
			quote: "Hey where ya going you big drip",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "MaTe",
			role: "tester",
			quote: "not having a girlfriend is part of my car's weight reduction kit",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "neptuneen",
			role: "tester",
			quote: "double the spins, double the profits. gazillion dollar profit!",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "CallyHam",
			role: "tester",
			quote: "<html:strong>h</html:strong>",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "Betty",
			role: "tester",
			quote: "Tonight, i ask you wholeheartedly to Hide your Ancestors. This is because Secret Agents are trying to Find and Incite them to this one National... whatever the fuck they call it 'Endless Loophole of Oblivion'.  this is a gatekept mission with the Objective to Kill all International and National citizens across the united states of america. this is not a Gag. Please. you're putting an Entire future of our race at risk by Not Interfering with their plans. be the change to Stop this massacre.",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "GuzzDoritos",
			role: "tester",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "Ojas",
			role: "tester",
			quote: "Ok.",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "Rhapsody2612",
			role: "tester",
			quote: "Hi, I'm Saul Goodman, did you know you have rights? Constitution says you do, and so do I. I believe, that, until proven guilty, every man, woman and child in this country is innocent. And that's why I fight for you, Albuquerque!",
			contributions: "Tested pre-release Geckium builds.",
			socials: [
				{
					name: "YouTube",
					url: "https://www.youtube.com/@rhapsody2612"
				}
			]
		},
		{
			name: "WackyIdeas",
			role: "tester",
			contributions: "Tested pre-release Geckium builds."
		},
		{
			name: "vxvian",
			role: "tester",
			quote: "also check out soggy.cat",
			contributions: "Tested pre-release Geckium builds.",
			socials: [
				{
					name: "YouTube",
					url: "https://www.youtube.com/channel/UCY-D_PGmZtR9HTeczwBxbrw/"
				}
			]
		},

		// Original developer
		{
			name: "nabrious",
			role: "og-developer",
			contributions: "Helped create the Material Design framework used in Geckium Settings and Geckium Wizard."
		}
	]

	credits.forEach(person => {
		const cardRoleTitle = document.createXULElement("h4");

		let importantText = "";
		if (person.importantText)
			importantText = person.importantText;
		else if (person.role == "main-developer")
			person.name = gSettingsBundle.GetStringFromName("mainDeveloper").replace("%s", person.name);

		let quote;
		if (person.quote)
			quote = `"${person.quote}"`;
		else
			quote = "";

		const creditTemplate = `
		<html:button data-name="${person.name}" class="item ripple-enabled">
			<hbox class="information-container" style="width: 100%">
				<vbox>
					<label class="name">${person.name}</label>
					<label class="description">${importantText}</label>
					<label class="description">${quote}</label>
					<label class="description" style="white-space: pre-wrap">Contributions: ${person.contributions}</label>
				</vbox>
				<spacer />
			</hbox>
		</html:button>
		`;

		const creditFragment = MozXULElement.parseXULToFragment(creditTemplate);

		if (person.role == "main-developer" || person.role == "developer") {
			let developersCard;

			if (document.querySelector("#developersCard.card")) {
				developersCard = document.querySelector("#developersCard.card")
			} else {
				developersCard = document.createXULElement("vbox");
				developersCard.id = "developersCard";
				developersCard.classList.add("card");

				cardRoleTitle.textContent = gSettingsBundle.GetStringFromName("developersTitle");
				creditsList.appendChild(cardRoleTitle);
				creditsList.appendChild(developersCard);
			}
			
			developersCard.appendChild(creditFragment);
		} else if (person.role == "tester") {
			let testersCard;

			if (document.querySelector("#testersCard.card")) {
				testersCard = document.querySelector("#testersCard.card")
			} else {
				testersCard = document.createXULElement("vbox");
				testersCard.id = "testersCard";
				testersCard.classList.add("card");

				cardRoleTitle.textContent = gSettingsBundle.GetStringFromName("testersTitle");
				creditsList.appendChild(cardRoleTitle);
				creditsList.appendChild(testersCard);
			}

			testersCard.appendChild(creditFragment);
		} else if (person.role == "og-developer") {
			let exDevelopersCard;

			if (document.querySelector("#exDevelopersCard.card")) {
				exDevelopersCard = document.querySelector("#exDevelopersCard.card")
			} else {
				exDevelopersCard = document.createXULElement("vbox");
				exDevelopersCard.id = "exDevelopersCard";
				exDevelopersCard.classList.add("card");

				cardRoleTitle.textContent = gSettingsBundle.GetStringFromName("exDevelopersTitle");
				creditsList.appendChild(cardRoleTitle);
				creditsList.appendChild(exDevelopersCard);
			}

			exDevelopersCard.appendChild(creditFragment);
		} else if (person.role == "js-loader") {
			let jsLoaderCard;

			if (document.querySelector("#jsLoaderCard.card")) {
				jsLoaderCard = document.querySelector("#jsLoaderCard.card")
			} else {
				jsLoaderCard = document.createXULElement("vbox");
				jsLoaderCard.id = "jsLoaderCard";
				jsLoaderCard.classList.add("card");

				cardRoleTitle.textContent = "JavaScript Loader";
				creditsList.appendChild(cardRoleTitle);
				creditsList.appendChild(jsLoaderCard);
			}

			jsLoaderCard.appendChild(creditFragment);
		}

		let creditElm = document.querySelector(`button[data-name="${person.name}"]`);

		if (person.socials) {
			const socialBox = document.createXULElement("vbox");
			socialBox.style.flexShrink = "0";
			socialBox.style.alignItems = "end";
			creditElm.querySelector(".information-container").appendChild(socialBox);
			person.socials.forEach(social => {
				const socialElm = document.createXULElement("label", { is: "text-link" });
				socialElm.classList.add("button", "ripple-enabled", "text", "disable-in-wizard");
				socialElm.setAttribute("href", social.url);
				socialElm.textContent = social.name;

				if (socialElm.textContent == gSettingsBundle.GetStringFromName("donateTo"))
					socialElm.classList.add("color");

				socialBox.appendChild(socialElm);
			});
		}
	})
}

buildCredits();