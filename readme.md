关于前端环境import.meta.env的设置>
在vite.config.js的同级目录下
创建`.env.production`文件, 用于配置生产环境变量;
创建`.env.development`文件, 用于配置开发环境变量;
然后在工程中就可以使用这些环境变量, 如服务器的IP。

>> 2025年8月17时, 在aarm62架构上, 会出现"Illegal instruction"错误

===============================================================================
>> 如何创建vite4+vue3工程

step1. 运行工程创建向导, 选择Vue前端, Typescript。
npm create vite@4 my-vue-app
一切顺利, npm install, npm run dev会提示一个网址，访问这个网址会出现"Vite+Vue"的面。

step2. 安装blockly模块
npm install blocky

step3. 创建


npm create vite@4 vue-blockly-start
选择Vue
选择javascript
  cd vue-blockly-start
  npm install
  npm install blockly

在./src/components目录下创建BlocklyEditor.vue, 注意import blockly的方式如下:
import * as Blockly from 'blockly';  // 正确的方式



  npm run dev
