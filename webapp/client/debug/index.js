//import UrlDecoder from '../../common/url-decoder';
import Vue from '../../vue/dist/vue.esm.browser.js';
import ajaj from '../ajaj.js';

import helper from '../../common/knots-helper/index.js'

const {
	MultiLevelDrawer,
	LevelsDiagram,
	render
} = helper;


const colors = [
	"#FED6BC",
	"#FFFADD",
	"#C3FBD8",
	"#B5F2EA",
	"#C6D8FF"
];

const template = `<div id="vue">
<div class="editor">
<div style="display:flex"><button @click="load();">Загрузить</button><button :disabled="saved" @click="save();">Сохранить</button></div>
<div style="display:flex"><button @click="render();">Строить</button><textarea v-model="param"></textarea></div>
<div><textarea v-model="code" style="width:30em; height: 40em"></textarea></div>
</div>
<div class="view"><svg 
	version="1.1"
    baseProfile="full"
    xmlns="http://www.w3.org/2000/svg"
    :width="width" :height="height"
	:viewBox="viewBox"
><g transform="scale(1, -1)" v-html="svg"></g></svg></div>
</div>`;

const vm = new Vue({
	el:"#vue",
	template,
	
	components:{

	},
	data:{
		width:"300px",
		height:"200px",
		viewBox:"0 0 300 200",
		svg:"",
		code:"draw o 2 u no",
		param:`{"a":1, "b":1}`,
		saved: true
	},
	computed:{

		
	},
	methods:{
		render:function(){
			let code = this.code;
			let params = JSON.parse(this.param);
			try{
				var env = MultiLevelDrawer.draw(code, params);
			}
			catch(e){
				console.log(e);
			}
			let knot = new LevelsDiagram(env.components);
			
			knot = knot.assemblyConnectedComponents();			
			knot.addSkewPoints();
			knot.moveAllZoutAngle();
			knot.moveZoutEnds();

			knot = knot.scale(10, 10);
			
			knot.components.forEach((cmp, i)=>{
				if(!cmp.color){
					cmp.color = colors[i];
				}
			});
			
			this.svg = knot.renderToSVG(2);
			
			let [A, B] = knot.rectangleArea(5);
			
			let size = B.sub(A);
			
			this.width=`${size.x}mm`;
			this.height=`${size.y}mm`;
			this.viewBox=`${A.x} ${-B.y} ${size.x} ${size.y}`;
			
			console.log('render');
		},
		
		load: function(){
			ajaj('../../rest/file/s.txt').then((code)=>{
				this.code = code;
				this.saved = true;
			});
		},
		
		save: function(){
			ajaj('../../rest/file/s.txt',{
				body:this.code,
				method:'PUT'
			}).then((status)=>{
				this.saved = true;
			});
		}
	},
	watch:{
		code:function(){
			this.saved = false;
		}
	}
});
