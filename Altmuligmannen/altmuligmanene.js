const phases = [
	{ name: "Project Management", tone: "gray", children: [
		{ name: "Management", items: ["Lederskap", "Møter og møtetider", "Dokumentasjon"] },
		{ name: "Infrastructure (team)", items: ["Hardware", "Software", "Kontorer", "Offentlige forsyningstjenester", "Andre forretnings- og driftsutgifter"] }
	] },
	{ name: "Analysis", tone: "blue", children: [
		{ name: "High Level", items: ["Markedsanalyse", "Interessentanalyse", "Konkurrentanalyse (Stakeholder analysis)", "Scope statement"] },
		{ name: "Low Level / Detail Level", items: ["Kravspesifikasjon", "Backlog", "Personas", "Verdiforslag (VPC)"] }
	] },
	{ name: "Infrastructure (produkt)", tone: "blue", items: ["Backend/database", "API-lag", "Integrasjon", "GUI / Frontend"] },
	{ name: "Profil", tone: "orange", items: ["Profilvisning", "Interne tilkoblinger", "Profilinnhold", "Kontolagring", "Innlogging", "Registrering"] },
	{ name: "Betaling i app", tone: "orange", items: ["Vipps-integrasjon", "Reservert beløp", "Flere betalingsmåter"] },
	{ name: "Ratingsystem", tone: "orange", items: ["Ratinglagring", "Ratingvisning", "Kundevurdering"] },
	{ name: "Kontraktoversikt", tone: "orange", items: ["Kontraktsignering", "Dokumentopplasting"] },
	{ name: "Jobboversikt", tone: "orange", items: ["Jobbliste", "Akseptflyt", "Aldersfiltrering"] },
	{ name: "Formidling", tone: "orange", items: ["Meldingssystem", "Geofiltrering", "Matching-algoritme", "Kartvisning", "Betalt plassering"] },
	{ name: "Automasjon", tone: "orange", items: ["Annonseopprettelse", "Varslingssystem"] },
	{ name: "Aktøroversikt", tone: "orange", items: ["Aktørprofilvisning"] },
	{ name: "Behovsavklaring", tone: "orange", items: ["Bildeopplasting", "Problemgjenkjenning"] },
	{ name: "e2e Test", tone: "blue", items: ["Testplan", "Integrasjonstest", "Brukertest"] },
	{ name: "Documentation", tone: "blue", items: ["Teknisk dokumentasjon", "Brukerdokumentasjon"] },
	{ name: "Support", tone: "cyan", items: ["Brukerveiledning / manual", "FAQ", "Kontakt oss"] }
];

const storageKey = "altmuligmannen-wbs-v1";
let completed = {};
try { completed = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { completed = {}; }
let showIncompleteOnly = localStorage.getItem("altmuligmannen-filter-incomplete") === "true";
let pendingPhaseTarget = "";
const list = document.querySelector("#wbs-list");

function taskId(phaseIndex, groupName, itemName) {
	return `${phaseIndex}:${groupName || ""}:${itemName}`;
}

function getTasks(phase, phaseIndex) {
	if (phase.children) return phase.children.flatMap(group => group.items.map(item => ({ item, group: group.name, id: taskId(phaseIndex, group.name, item) })));
	return phase.items.map(item => ({ item, group: "", id: taskId(phaseIndex, "", item) }));
}

function render() {
	const isLanding = location.hash === "" || location.hash === "#start";
	document.querySelector(".app-shell").classList.toggle("landing-view", isLanding);
	const brandName = document.querySelector(".brand-name");
	brandName.setAttribute("aria-disabled", String(isLanding));
	brandName.tabIndex = isLanding ? -1 : 0;
	list.replaceChildren();
	phases.forEach((phase, phaseIndex) => {
		const tasks = getTasks(phase, phaseIndex);
		const doneCount = tasks.filter(task => completed[task.id]).length;
		const card = document.createElement("button");
		card.type = "button";
		card.className = "phase";
		card.dataset.tone = phase.tone;
		card.dataset.index = phaseIndex;
		card.dataset.search = `${phase.name} ${tasks.map(task => `${task.group} ${task.item}`).join(" ")}`.toLocaleLowerCase("no");
		card.innerHTML = `<span class="phase-header"><span class="phase-number">${String(phaseIndex + 1).padStart(2, "0")}</span><span class="phase-title"></span><span class="phase-meta"><span class="phase-count">${doneCount}/${tasks.length}</span><span class="mini-track"><span style="width:${tasks.length ? doneCount / tasks.length * 100 : 0}%"></span></span><span class="chevron">↗</span></span></span>`;
		card.querySelector(".phase-title").textContent = phase.name;
		card.addEventListener("click", () => { location.hash = `fase-${phaseIndex}`; });
		list.append(card);
	});
	updateSummary();
	renderPhasePage();
	renderMorePage();
	applyFilters();
}

function renderPhasePage() {
	const appShell = document.querySelector(".app-shell");
	const phasePage = document.querySelector("#phase-page");
	const match = location.hash.match(/^#fase-(\d+)$/);
	const phaseIndex = match ? Number(match[1]) : -1;
	const phase = phases[phaseIndex];
	appShell.classList.toggle("phase-view", Boolean(phase));
	appShell.classList.remove("more-view");
	phasePage.replaceChildren();
	if (!phase) return;
	document.querySelectorAll(".mobile-nav a").forEach(link => link.classList.toggle("active", link.id === "mobile-tasks-link"));

	const tasks = getTasks(phase, phaseIndex);
	const doneCount = tasks.filter(task => completed[task.id]).length;
	const back = document.createElement("button");
	back.type = "button";
	back.className = "phase-back";
	back.innerHTML = "<span aria-hidden='true'>←</span>Tilbake til arbeidsstruktur";
	back.addEventListener("click", () => navigateHome("work-breakdown"));
	phasePage.append(back);

	const heading = document.createElement("div");
	heading.className = "phase-detail-heading";
	heading.dataset.tone = phase.tone;
	heading.innerHTML = `<span class="phase-number">${String(phaseIndex + 1).padStart(2, "0")}</span><h1></h1>`;
	heading.querySelector("h1").textContent = phase.name;
	phasePage.append(heading);

	const summary = document.createElement("p");
	summary.className = "phase-detail-summary";
	summary.textContent = `${tasks.length} oppgaver i dette arbeidsområdet`;
	phasePage.append(summary);

	const progress = document.createElement("div");
	progress.className = "detail-progress";
	progress.innerHTML = `<div class="detail-progress-label"><span>Fremdrift</span><span>${doneCount} av ${tasks.length} ferdig</span></div><div class="progress-track"><div class="progress-fill" style="width:${tasks.length ? doneCount / tasks.length * 100 : 0}%"></div></div>`;
	phasePage.append(progress);

	const groups = document.createElement("div");
	groups.className = "detail-groups";
	(phase.children || [{ name: "Oppgaver", taskGroupName: "", items: phase.items }]).forEach(group => {
		const groupSection = document.createElement("section");
		groupSection.className = "detail-group";
		if (group.name) {
			const groupHeading = document.createElement("h2");
			groupHeading.textContent = group.name;
			groupSection.append(groupHeading);
		}
		const itemList = document.createElement("div");
		itemList.className = "detail-items";
		group.items.forEach(item => {
			const id = taskId(phaseIndex, group.taskGroupName ?? group.name, item);
			const row = document.createElement("label");
			row.className = `work-item${completed[id] ? " is-done" : ""}`;
			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.checked = Boolean(completed[id]);
			checkbox.setAttribute("aria-label", `Marker ${item} som ferdig`);
			checkbox.addEventListener("change", () => {
				completed[id] = checkbox.checked;
				localStorage.setItem(storageKey, JSON.stringify(completed));
				render();
			});
			const text = document.createElement("span");
			text.textContent = item;
			row.append(checkbox, text);
			itemList.append(row);
		});
		groupSection.append(itemList);
		groups.append(groupSection);
	});
	phasePage.append(groups);
	if (pendingPhaseTarget) {
		const targetRow = [...phasePage.querySelectorAll(".work-item")].find(row => row.textContent.trim() === pendingPhaseTarget);
		if (targetRow) {
			targetRow.classList.add("support-highlight");
			targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
			window.setTimeout(() => targetRow.classList.remove("support-highlight"), 2200);
		}
		pendingPhaseTarget = "";
	}
}

function renderMorePage() {
	const appShell = document.querySelector(".app-shell");
	const morePage = document.querySelector("#more-page");
	const match = location.hash.match(/^#mer-(settings|help|contact|documentation)$/);
	const pageKey = match ? match[1] : "";
	appShell.classList.toggle("more-view", Boolean(pageKey));
	morePage.replaceChildren();
	if (!pageKey) {
		document.querySelector("#more-toggle").classList.remove("active");
		return;
	}
	appShell.classList.remove("phase-view");
	document.querySelectorAll(".mobile-nav a").forEach(link => link.classList.remove("active"));
	document.querySelector("#more-toggle").classList.add("active");

	const pageContent = {
		settings: { title: "Innstillinger", intro: "Tilpass hvordan arbeidsoppgavene vises.", content: `<div class="more-setting"><label class="setting-row"><input id="setting-incomplete" type="checkbox" ${showIncompleteOnly ? "checked" : ""}><span><strong>Vis bare uferdige oppgaver</strong><small>Skjul arbeidsområder der alle oppgavene er fullført.</small></span></label></div>` },
		help: { title: "Hjelp", intro: "Finn svar på vanlige spørsmål om Altmuligmannen App.", content: `<div class="more-action-list"><button class="more-action-card" type="button" data-more-target="faq"><span><strong>Vanlige spørsmål</strong><small>Åpne FAQ under Support.</small></span><span class="more-action-arrow" aria-hidden="true">→</span></button></div>` },
		contact: { title: "Kontakt support", intro: "Gå til kontaktsiden for å finne kontaktpunktet for support.", content: `<div class="more-action-list"><button class="more-action-card" type="button" data-more-target="contact"><span><strong>Kontakt oss</strong><small>Åpne kontaktpunktet under Support.</small></span><span class="more-action-arrow" aria-hidden="true">→</span></button></div>` },
		documentation: { title: "Dokumentasjon", intro: "Velg dokumentasjonen du vil åpne.", content: `<div class="more-action-list"><button class="more-action-card" type="button" data-more-target="technical-docs"><span><strong>Teknisk dokumentasjon</strong><small>For utvikling og teknisk oppsett.</small></span><span class="more-action-arrow" aria-hidden="true">→</span></button><button class="more-action-card" type="button" data-more-target="user-docs"><span><strong>Brukerdokumentasjon</strong><small>Veiledning for bruk av appen.</small></span><span class="more-action-arrow" aria-hidden="true">→</span></button></div>` }
	};
	const page = pageContent[pageKey];
	morePage.innerHTML = `<button type="button" class="phase-back" data-more-back><span aria-hidden="true">←</span>Tilbake til oversikten</button><div class="phase-detail-heading"><span class="phase-number">•••</span><h1>${page.title}</h1></div><div class="more-page-content"><p>${page.intro}</p>${page.content}</div>`;
	morePage.querySelector("[data-more-back]").addEventListener("click", () => navigateHome("overview"));
	morePage.querySelectorAll("[data-more-target]").forEach(button => button.addEventListener("click", () => {
		const destination = button.dataset.moreTarget;
		if (destination === "faq") openPhase(14, "FAQ");
		if (destination === "contact") openPhase(14, "Kontakt oss");
		if (destination === "technical-docs") openPhase(13, "Teknisk dokumentasjon");
		if (destination === "user-docs") openPhase(13, "Brukerdokumentasjon");
	}));
}

function updateSummary() {
	const allTasks = phases.flatMap((phase, index) => getTasks(phase, index));
	const done = allTasks.filter(task => completed[task.id]).length;
	const rate = allTasks.length ? Math.round(done / allTasks.length * 100) : 0;
	document.querySelector("#total-phases").textContent = phases.length;
	document.querySelector("#total-tasks").textContent = allTasks.length;
	document.querySelector("#done-tasks").textContent = done;
	document.querySelector("#completion-rate").textContent = `${rate}%`;
	document.querySelector("#side-progress-label").textContent = `${done} av ${allTasks.length} oppgaver ferdig`;
	document.querySelector("#side-progress-fill").style.width = `${rate}%`;
	const next = allTasks.find(task => !completed[task.id]);
	const nextPhase = next ? phases[Number(next.id.split(":")[0])] : null;
	document.querySelector("#next-phase").textContent = nextPhase ? nextPhase.name : "Alt er fullført";
	document.querySelector("#next-phase-subtitle").textContent = next ? `Neste oppgave: ${next.item}` : "Alle oppgavene i planen er markert ferdig";
}

function applyFilters() {
	const query = document.querySelector("#search").value.trim().toLocaleLowerCase("no");
	let visibleCount = 0;
	document.querySelectorAll(".phase").forEach(phaseCard => {
		const index = Number(phaseCard.dataset.index);
		const tasks = getTasks(phases[index], index);
		const hasIncomplete = tasks.some(task => !completed[task.id]);
		const matches = phaseCard.dataset.search.includes(query) && (!showIncompleteOnly || hasIncomplete);
		phaseCard.hidden = !matches;
		if (matches) visibleCount++;
	});
	document.querySelector("#empty-state").classList.toggle("visible", visibleCount === 0);
}

function syncFilterControls() {
	const filterButton = document.querySelector("#filter-button");
	filterButton.textContent = showIncompleteOnly ? "Ikke ferdig" : "Alle";
	filterButton.setAttribute("aria-pressed", String(showIncompleteOnly));
	const setting = document.querySelector("#setting-incomplete");
	if (setting) setting.checked = showIncompleteOnly;
}

function setMoreMenuOpen(isOpen) {
	const moreToggle = document.querySelector("#more-toggle");
	document.querySelector("#more-menu").hidden = !isOpen;
	moreToggle.setAttribute("aria-expanded", String(isOpen));
	moreToggle.classList.toggle("active", isOpen);
}

function openPhase(phaseIndex, targetText) {
	pendingPhaseTarget = targetText;
	const nextHash = `#fase-${phaseIndex}`;
	if (location.hash === nextHash) render();
	else location.hash = nextHash;
}

function openMorePage(pageKey) {
	setMoreMenuOpen(false);
	const nextHash = `#mer-${pageKey}`;
	if (location.hash === nextHash) render();
	else location.hash = nextHash;
}

document.querySelector("#search").addEventListener("input", applyFilters);
document.querySelector("#filter-button").addEventListener("click", () => {
	showIncompleteOnly = !showIncompleteOnly;
	localStorage.setItem("altmuligmannen-filter-incomplete", String(showIncompleteOnly));
	syncFilterControls();
	applyFilters();
});
document.addEventListener("change", event => {
	if (!event.target.matches("#setting-incomplete")) return;
	showIncompleteOnly = event.target.checked;
	localStorage.setItem("altmuligmannen-filter-incomplete", String(showIncompleteOnly));
	syncFilterControls();
	applyFilters();
});

document.querySelector("#more-toggle").addEventListener("click", () => {
	setMoreMenuOpen(document.querySelector("#more-menu").hidden);
});
document.addEventListener("click", event => {
	if (!event.target.closest("#more-menu, #more-toggle")) setMoreMenuOpen(false);
});
document.addEventListener("keydown", event => {
	if (event.key === "Escape") setMoreMenuOpen(false);
});
document.querySelectorAll("[data-more-action]").forEach(button => button.addEventListener("click", () => {
	openMorePage(button.dataset.moreAction);
}));

function navigateHome(sectionId) {
	setMoreMenuOpen(false);
	const target = document.querySelector(`#${sectionId}`);
	if (location.hash !== "#overview") {
		window.addEventListener("hashchange", () => target.scrollIntoView({ behavior: "smooth" }), { once: true });
		location.hash = "#overview";
		return;
	}
	target.scrollIntoView({ behavior: "smooth" });
}

document.querySelector(".brand-name").addEventListener("click", event => {
	event.preventDefault();
	if (document.querySelector(".app-shell").classList.contains("landing-view")) return;
	document.querySelectorAll(".mobile-nav a").forEach(link => link.classList.toggle("active", link.dataset.homeSection === "overview"));
	navigateHome("overview");
});
document.querySelector(".brand-logo-link").addEventListener("click", event => {
	event.preventDefault();
	setMoreMenuOpen(false);
	document.querySelectorAll(".mobile-nav a").forEach(link => link.classList.remove("active"));
	document.querySelector("#more-toggle").classList.remove("active");
	if (location.hash !== "#start") location.hash = "#start";
	else document.querySelector("main").scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelectorAll("[data-role-choice]").forEach(button => button.addEventListener("click", () => {
	document.querySelectorAll(".mobile-nav a").forEach(link => link.classList.toggle("active", link.dataset.homeSection === "overview"));
	navigateHome("overview");
}));

document.querySelectorAll("[data-scroll]").forEach(button => button.addEventListener("click", () => {
	document.querySelector(`#${button.dataset.scroll}`).scrollIntoView({ behavior: "smooth" });
}));
document.querySelectorAll(".mobile-nav a").forEach(link => link.addEventListener("click", event => {
	event.preventDefault();
	setMoreMenuOpen(false);
	document.querySelectorAll(".mobile-nav a").forEach(item => item.classList.toggle("active", item === link));
	navigateHome(link.dataset.homeSection);
}));

window.addEventListener("hashchange", render);
syncFilterControls();
render();
