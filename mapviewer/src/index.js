import { qgis, QGIS_JS_VERSION } from "qgis-js";

import { useProjects } from "@qgis-js/utils";

import { jsDemo } from "./js.js";

import { olDemoXYZ, olDemoCanvas } from "./ol.js";
import { layersControl } from "./layers.js";

const printVersion = true;
const apiTest = false;
const timer = false;

const qgisJsDemoProjects = (path) => ({
  owner: "boardend",
  repo: "qgis-js-projects",
  path: "/" + path,
  branch: "main",
  prefix: `${path[0].toUpperCase()}${path.slice(1)}: `,
});

const GITHUB_REPOS = [qgisJsDemoProjects("demo")];

function testApi(api) {
  const p1 = new api.PointXY();
  console.dir(p1);

  const r1 = new api.Rectangle();
  console.log(r1);

  const r2 = new api.Rectangle(1, 2, 3, 4);
  console.log(r2.xMinimum, r2.yMinimum, r2.xMaximum, r2.yMaximum);
  r2.scale(5);
  console.log(r2.xMinimum, r2.yMinimum, r2.xMaximum, r2.yMaximum);
}

async function initDemo() {
  if (printVersion) {
    console.log(`qgis-js (${QGIS_JS_VERSION})`);
  }

  const statusControl = document.getElementById("status");
  const projectControl = document.getElementById("project");

  let isError = false;
  const onStatus = (status) => {
    if (isError) return;
    statusControl.firstElementChild.innerHTML = status;
  };
  const onError = (error) => {
    isError = true;
    console.error(error);
    const message =
      "" + error && error["message"] ? error["message"] : "Runtime error";
    projectControl.style.visibility = "none";
    statusControl.style.display = "auto";
    statusControl.innerHTML = `<div class="alert alert-danger" role="alert">
      <b style="color: red">Error:&nbsp;</b>
      ${message}
    </div>`;
  };
  const onReady = () => {
    statusControl.style.display = "none";
    projectControl.style.visibility = "visible";
  };

  try {
    // boot the runtime
    if (timer) console.time("boot");
    const { api, fs } = await qgis({
      // use assets form QgisRuntimePlugin
      prefix: "/journal/maps/assets/wasm",
      onStatus: (status) => onStatus(status),
    });
    if (timer) console.timeEnd("boot");

    // prepare project management
    onStatus("Loading projects...");
    const updateCallbacks = [];
    const renderCallbacks = [];

    const {
      openProject,
      loadLocalProject,
      loadRemoteProjects,
      loadGithubProjects,
    } = useProjects(fs, (project) => {
      if (timer) console.time("project");
      api.loadProject(project);
      if (timer) console.timeEnd("project");

      // update all demos
      setTimeout(() => {
        updateCallbacks.forEach((update) => update());
      }, 0);
    });

    const openLocalProject = async function () {
      const localProject = await loadLocalProject();
      await openProject(localProject);
      listProject(localProject.name, () => localProject);
      projectSelect.value = localProject.name;
    };

    const projects = new Map();
    const projectSelect = document.getElementById("projects");
    projectSelect.addEventListener("change", () => {
      const project = projects.get(projectSelect.value);
      if (project) {
        openProject(project());
      }
    });
    const listProject = (name, projectLoadFunciton) => {
      projects.set(name, projectLoadFunciton);
      const option = document.createElement("option");
      option.value = name;
      option.text = name;
      projectSelect.add(option, null);
    };
    document.getElementById("local-project").onclick = openLocalProject;

    // load remote projects
    if (timer) console.time("remote projects");
    const remoteProjects = await loadRemoteProjects();
    remoteProjects.forEach((project) =>
      listProject(project.name, () => project)
    );
    if (timer) console.timeEnd("remote projects");

    // - github projects
    if (timer) console.time("github projects");
    for (const repo of GITHUB_REPOS) {
      try {
        const githubProjects = await loadGithubProjects(
          repo.owner,
          repo.repo,
          repo.path,
          repo.branch
        );
        Object.entries(githubProjects).forEach(([name, projectLoadPromise]) => {
          listProject((repo.prefix || "") + name, projectLoadPromise);
        });
      } catch (error) {
        console.warn(
          `Unable to load GitHub project "${repo.owner}/${repo.repo}"`,
          error
        );
      }
    }
    if (timer) console.timeEnd("github projects");

    // open first project
    onStatus("Opening first project...");
    await openProject(remoteProjects[0]);

    // API tests
    // if (apiTest) testApi(api);

    // paint a first dummy frame
    onStatus("Rendering first frame...");
    if (timer) console.time("first frame");
    await api.renderImage(api.srid(), api.fullExtent(), 42, 42, 1);
    if (timer) console.timeEnd("first frame");

    onReady();

    const layersControlDiv = document.getElementById("layers-control");
    if (layersControlDiv) {
      updateCallbacks.push(
        layersControl(layersControlDiv, api, () => {
          // update all demos
          setTimeout(() => {
            renderCallbacks.forEach((render) => render());
          }, 0);
        })
      );
    }

    // js demo
    const jsDemoCanvas = document.getElementById("js-demo-canvas");
    if (jsDemoCanvas) {
      const { update, render } = jsDemo(jsDemoCanvas, api);
      updateCallbacks.push(update);
      renderCallbacks.push(render);
      // ensure js demo gets refreshed when the section gets visible
      const jsButton = document.getElementById("tab1");
      jsButton.addEventListener("change", () => {
        if (jsButton.checked) update();
      });
    }

    // ol demo
    const olDemoXYZDiv = document.getElementById("ol-demo-xyz");
    if (olDemoXYZDiv) {
      const { update, render } = olDemoXYZ(olDemoXYZDiv, api);
      updateCallbacks.push(update);
      renderCallbacks.push(render);
    }

    const olDemoCanvasDiv = document.getElementById("ol-demo-canvas");
    if (olDemoCanvasDiv) {
      const { update, render } = olDemoCanvas(olDemoCanvasDiv, api);
      updateCallbacks.push(update);
      renderCallbacks.push(render);
    }
  } catch (error) {
    onError(error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initDemo();
});
