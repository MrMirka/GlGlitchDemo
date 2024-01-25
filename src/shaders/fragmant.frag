uniform sampler2D tDiffuse;
uniform float uTime;
uniform vec2 uMouse;
uniform float uAspectRatio;
varying vec2 vUv;

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}

float snoise(vec2 v){
        const vec4 C=vec4(.211324865405187,// (3.0-sqrt(3.0))/6.0
        .366025403784439,// 0.5*(sqrt(3.0)-1.0)
        -.577350269189626,// -1.0 + 2.0 * C.x
    .024390243902439);// 1.0 / 41.0
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1;
    i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz;
    x12.xy-=i1;
    i=mod289(i);// Avoid truncation effects in permutation
    vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))
    +i.x+vec3(0.,i1.x,1.));

    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m=m*m;
    m=m*m;
    vec3 x=2.*fract(p*C.www)-1.;
    vec3 h=abs(x)-.5;
    vec3 ox=floor(x+.5);
    vec3 a0=x-ox;
    m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
}

void main(){
    vec4 color=texture2D(tDiffuse,vUv);

    vec2 mouseUV=uMouse*.5+.5;
    float aspectCorrectedDistX=(vUv.x-mouseUV.x)*uAspectRatio;
    float aspectCorrectedDistY=vUv.y-mouseUV.y;
    float dist=sqrt(aspectCorrectedDistX*aspectCorrectedDistX+aspectCorrectedDistY*aspectCorrectedDistY);

    // Применение шума Perlin к радиусу круга
    float modulatedTime=mod(uTime,10.);// Зацикленное время
    float noiseEffect=snoise(vUv*modulatedTime*3.2);
    float dynamicRadius=.1+noiseEffect*.05;

    // Использование smoothstep для создания размытых краев
    float edgeWidth=.02;// Ширина размытия края
    float alpha=1.-smoothstep(dynamicRadius-edgeWidth,dynamicRadius,dist);

    if(dist<dynamicRadius){
        float noiseR=snoise(vUv*modulatedTime*2.+vec2(.5,-.5));
        float noiseG=snoise(vUv*modulatedTime*2.+vec2(-.5,.5));
        float noiseB=snoise(vUv*modulatedTime*2.);
        
        vec2 shiftR=vec2(noiseR*.01,0.);
        vec2 shiftG=vec2(noiseG*.01,0.);
        vec2 shiftB=vec2(noiseB*.01,0.);
        
        float r=texture2D(tDiffuse,vUv+shiftR).r;
        float g=texture2D(tDiffuse,vUv+shiftG).g;
        float b=texture2D(tDiffuse,vUv+shiftB).b;
        
        gl_FragColor=vec4(r,g,b,alpha);
    }else{
        gl_FragColor=vec4(color.rgb,1.-alpha);
    }
}