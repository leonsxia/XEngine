# XEngine

install:
npm install

run:
npx vite

This is a 3D scene manager and simple physics simulator based on three.js.

You can use this project to build new scenes, such as old-school "***Resident Evil***" scenes.

Use WASD to move the player, Shift to accelerate, S + Shift to quick turn around. Please click "start" on the left menu->Actions first to enable playing.

Have fun!!!

Here is the tutorial:
1. The assets incluedes textures and models will downloaded from the website first, around 170MB, and will take several seconds.
2. When all loaded, you will see an initial scene like this:

      ![1](https://github.com/user-attachments/assets/10f4cc78-e8db-4cff-95cb-78fda63da365)

3. Click "start" on the left menu->Actions->start will start this scene to render, and the fps will start to count. On the other hand, you can click "stop" to stop the scene from rendering, it will render only when you move the camera.

      ![2](https://github.com/user-attachments/assets/5676e40c-f7b7-4da7-9347-a18fb5ff0f74)

4. If your fps is too low, try 2 things:
    1. Resize your browser to smaller scales.
    2. Change "Resolution" to a lower level, because the pixel rate on Mac is 2 as default, this will render 2 times bigger than the actual browser pixel.

      ![3](https://github.com/user-attachments/assets/12676751-916c-40ea-a8c0-4d4ab4e41946)

5. Change cameras, there are 3 types of camera controls:
    1. Default OrbitControls based on three.js, use the mouse left to rotate the camera, use the mouse right to move the camera.
    2. ThridPersonCamera, this will bind the camera to the current player position perspectively. This camera is configurable in the scene, select "enable" on the left menu->Third Person Camera->TPC->enable.

      ![4](https://github.com/user-attachments/assets/93f2830d-cc21-44fc-bb42-0de2c1b9c669)
   
    3. InspectorCamera, this camera simulates for "Resident Evil" type of camera. This camera is configurable in the scene, select "enable" on the left menu->Inspector Camera->InsCam->enable.

      ![5](https://github.com/user-attachments/assets/4c57a8c0-567a-46f7-9b5a-b4996b4d1f85)

6. Enable post-processing and change effects.
    1. Select "enable" on the left menu->Post Processing->PostEffect->enable to turn on post-processing effects.

      ![6](https://github.com/user-attachments/assets/a6d6f908-aff3-4cf0-b88d-7a60335814ad)

7. XEngine supports 5 kinds of effects:
    1. Picker, this will allow you to pick objects on the scene. When an object is picked, the right "Objects Control" will allow you to adjust its position and rotation.

      ![7](https://github.com/user-attachments/assets/b7ce8948-65fc-441f-9f4a-1f71412c46d3)
   
    2. You can use "resetScene" button on the left menu->Actions->resetScene to reset all changed objects to initial status.
    3. FXAA, enable Fast Approximate Anti-aliasing.
    4. SSAA, enable Supersampling Anti-aliasing, ***caution***: this will cost performance drop massively, use it carefully. You can also change the "SSAASampleLevel".
    5. SSAO, enable Screen Space Ambient Occlusion, ***caution***: this will cost 20-30fps drop, use it carefully. Change "SSAOOutput" to see different output effects.

      ![8](https://github.com/user-attachments/assets/3db7820b-cd0b-4d5f-a426-8097022754b0)
   
    6. Bloom, enable bloom lighting effect, this will turn on some lights in the scene too which is configuable in the scene. ***caution***: this will cost 20-30fps drop, use it carefully. Change "BloomStrength" or "BloomRadius" to adjust the effect level.

      ![9](https://github.com/user-attachments/assets/11bb6b86-2054-45c2-9fd1-b60b7f294246)

8. Select Control. You can change to "Lights Control" on the left menu->Select Control->control->Lights Control. Then the right control panel will change to lights, which are grouped by rooms. It will allow you to adjust each light parameter and its shadow.

   ![12](https://github.com/user-attachments/assets/dd8bc19f-bbbb-4f26-a6b9-b9d415a65d88)

9. Use "saveScene" and "loadScene"
    1. On the left menu->Actions->saveScene button, click it to pop up a file dialogue to save the current scene config JSON file to local. *caution* Edge will save directly without popping up a file dialogue.

      ![10](https://github.com/user-attachments/assets/e6b5945b-ce34-4065-82de-349a1caf0629)
    
    2. On the left menu->Actions->loadScene button, click it to pop up a file select dialogue to select a scene config JSON file which you saved locally to load from it.

10. Change scenes, use the left menu->Select World->scene to change from scenes.
    
   ![11](https://github.com/user-attachments/assets/bd77b44a-d3fc-46ea-a58e-ff5aea66c11a)






    


