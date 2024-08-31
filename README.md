# XEngine

This is a 3D scene manager and simple physics simulator based on three.js.

You can use this project to build new scenes like old school "Resident Evil" type scenes.

Have fun!!!

Here is the tutorial:
1. The assets inclueds textures and models will downloaded from website first, around 170MB, cost several seconds.
   
2. When all loaed, you will see a initial scene like this:

![1](https://github.com/user-attachments/assets/10f4cc78-e8db-4cff-95cb-78fda63da365)

4. Click "start" on the left menu->Actions->start will start this scene to render, the fps will start to count. On the other hand you can click "stop" to stop the scene from rendering, it will render only when you move the camera.
   
![2](https://github.com/user-attachments/assets/5676e40c-f7b7-4da7-9347-a18fb5ff0f74)

5. If your fps is too low, try 2 things:
    1). Resize you browser to smaller scales
    2). Change "Resolution" to lower level, because the pixel rate on Mac is 2 as default, this will render 2 times bigger than the actual browser pixel.
   
![3](https://github.com/user-attachments/assets/12676751-916c-40ea-a8c0-4d4ab4e41946)

6. Change cameras, there are 3 types of camera controls:
    1). Default OrbitControls based on three.js, use mouse left to rotate camera, use mouse right to move camera.
    2). ThridPersonCamera, this will bind camera to current player position perspectively. This camera is configurable in scene, select "enable" on the left menu->Third Person Camera->TPC->enable
   
![4](https://github.com/user-attachments/assets/93f2830d-cc21-44fc-bb42-0de2c1b9c669)

    3). InspectorCamera, this camera simulates for "Resident Evil" type of camera. This camera is configurable in scene, select "enable" on the left menu->Inspector Camera->InsCam->enable
    
![5](https://github.com/user-attachments/assets/4c57a8c0-567a-46f7-9b5a-b4996b4d1f85)

7. Enable post-processing and change effects.
    1). Select "enable" on the left menu->Post Processing->PostEffect->enable to turn on post-processing effects
   
![6](https://github.com/user-attachments/assets/a6d6f908-aff3-4cf0-b88d-7a60335814ad)

8. XEngine supports 5 kinds of effects:
    1). Picker, this will allow you to pick object on the scene. When an object is picked, the right "Objects Control" will allow you to adjust its position and rotation
    
![7](https://github.com/user-attachments/assets/b7ce8948-65fc-441f-9f4a-1f71412c46d3)
        You can use "resetScene" button on the left menu->Actions->resetScene to reset all changed objects to initial status.
    2). FXAA, enable Fast Approximate Anti-aliasing.
    3). SSAA, enable Supersampling Anti-aliasing, *caution* this will cost performance drop massively, use it carefully. You can also change the "SSAASampleLevel".
    4). SSAO, enable Screen Space Ambient Occlusion, *caution* this will cost 20-30fps drop, use it carefully. Change "SSAOOutput" to see diffrent output effects.
    
![8](https://github.com/user-attachments/assets/3db7820b-cd0b-4d5f-a426-8097022754b0)

    5). Bloom, enable bloom lighting effect, this will turn on some lights in the scene too which is configuable in scene. *caution* this will cost 20-30fps drop, use it carefully. Change "BloomStrength" or "BloomRadius" to adjust effect level.
    
![9](https://github.com/user-attachments/assets/11bb6b86-2054-45c2-9fd1-b60b7f294246)

9. Select Control. You can change to "Lights Control" on left menu->Select Control->control->Lights Control. Then the right control panel will change to lights, which is grouped by rooms. It will allow you adjust each light parameters and its shadow.
    
![9](https://github.com/user-attachments/assets/c79d0016-3e69-4c6a-b79b-c243a4634277)

10. Use "saveScene" and "loadScene"
    1). On left menu->Actions->saveScene button, click it to pop-up a file dialog to save current scene config json file to local. *caution* Edge will save directly without poping up a file dialog.
    
![10](https://github.com/user-attachments/assets/e6b5945b-ce34-4065-82de-349a1caf0629)

    2). On left menu->Actions->loadScene button, click it to pop-up a file select dialog to select a scene config json file which you saved locally to load from it.

11. Change scenes, use left menu->Select World->scene to change from scenes.
    
![11](https://github.com/user-attachments/assets/bd77b44a-d3fc-46ea-a58e-ff5aea66c11a)






    


