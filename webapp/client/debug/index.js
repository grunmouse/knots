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
<div class="view"><svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg"
	:width="width" :height="height"
	:viewBox="viewBox"
><g transform="scale(1, -1)" v-html="svg"></g></svg>
<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" width="130mm" heigth="5mm" viewBox = "-50 0 130 5">
<rect x="-50" y="0" width="10" height="5" class="level-50-fill" />
<rect x="-40" y="0" width="10" height="5" class="level-40-fill" />
<rect x="-30" y="0" width="10" height="5" class="level-30-fill" />
<rect x="-20" y="0" width="10" height="5" class="level-20-fill" />
<rect x="-10" y="0" width="10" height="5" class="level-10-fill" />
<rect x="0" y="0" width="10" height="5" class="level0-fill" />
<rect x="10" y="0" width="10" height="5" class="level10-fill" />
<rect x="20" y="0" width="10" height="5" class="level20-fill" />
<rect x="30" y="0" width="10" height="5" class="level30-fill" />
<rect x="40" y="0" width="10" height="5" class="level40-fill" />
<rect x="50" y="0" width="10" height="5" class="level50-fill" />
<rect x="60" y="0" width="10" height="5" class="level60-fill" />
<rect x="70" y="0" width="10" height="5" class="level70-fill" />
</svg>
</div>
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
