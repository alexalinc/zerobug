"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MeshGradientShaderProps = {
  className?: string;
  colors?: string[];
};

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as [
    number,
    number,
    number,
  ];
}

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;
uniform vec3 u_c5;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

void main(){
  vec2 uv=gl_FragCoord.xy/max(u_resolution.xy, vec2(1.0));
  float t=u_time*0.15;
  float n1=snoise(uv*1.4+vec2(t,t*0.7));
  float n2=snoise(uv*2.1+vec2(-t*0.8,t*0.5));
  float n3=snoise(uv*0.9+vec2(t*0.4,-t));
  float w1=smoothstep(-0.2,0.8,n1*0.5+0.5);
  float w2=smoothstep(-0.1,0.9,n2*0.5+0.5);
  float w3=smoothstep(0.0,1.0,n3*0.5+0.5);
  vec3 col=mix(u_c1,u_c2,w1);
  col=mix(col,u_c3,w2*0.65);
  col=mix(col,u_c4,w3*0.45);
  col=mix(col,u_c5,0.18+0.12*sin(t+uv.x*3.0));
  float vignette=smoothstep(1.2,0.25,length(uv-0.5));
  col*=0.55+0.45*vignette;
  gl_FragColor=vec4(col,1.0);
}
`;

/** CSS mesh that always animates — works even when WebGL is blocked / fails. */
function CssMeshFallback({ colors }: { colors: string[] }) {
  const [c1, c2, c3, c4, c5] = [
    colors[0] ?? "#052e16",
    colors[1] ?? "#166534",
    colors[2] ?? "#22c55e",
    colors[3] ?? "#0ea5e9",
    colors[4] ?? "#09090b",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 10% 20%, ${c1} 0%, transparent 55%), radial-gradient(100% 90% at 90% 10%, ${c3} 0%, transparent 50%), radial-gradient(90% 80% at 70% 80%, ${c4} 0%, transparent 55%), linear-gradient(160deg, ${c5}, ${c2})`,
        }}
      />
      <div
        className="mesh-drift absolute -left-1/4 -top-1/4 h-[70%] w-[70%] rounded-full opacity-70 blur-3xl"
        style={{ background: c3 }}
      />
      <div
        className="mesh-drift-reverse absolute -bottom-1/4 -right-1/4 h-[75%] w-[75%] rounded-full opacity-60 blur-3xl"
        style={{ background: c4 }}
      />
      <div
        className="mesh-drift absolute left-1/3 top-1/2 h-[50%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl [animation-delay:-4s]"
        style={{ background: c2 }}
      />
    </div>
  );
}

export function MeshGradientShader({
  className,
  colors = ["#052e16", "#166534", "#22c55e", "#0ea5e9", "#09090b"],
}: MeshGradientShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglOk, setWebglOk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl =
      canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      }) ||
      (canvas.getContext("experimental-webgl", {
        antialias: false,
        alpha: false,
      }) as WebGLRenderingContext | null);

    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const locs = ["u_c1", "u_c2", "u_c3", "u_c4", "u_c5"].map((n) =>
      gl.getUniformLocation(program, n),
    );
    const rgb = colors.slice(0, 5).map(hexToRgb);
    while (rgb.length < 5) rgb.push(rgb[rgb.length - 1] ?? [0, 0, 0]);
    locs.forEach((loc, i) => {
      const c = rgb[i]!;
      gl.uniform3f(loc, c[0], c[1], c[2]);
    });

    let raf = 0;
    const start = performance.now();
    let running = true;
    let drawn = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      return rect.width > 0 && rect.height > 0;
    };

    const frame = (now: number) => {
      if (!running) return;
      if (resize()) {
        gl.uniform1f(uTime, (now - start) / 1000);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if (!drawn) {
          drawn = true;
          setWebglOk(true);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(container);

    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      // Don't delete GL resources aggressively — Strict Mode remounts reuse the same canvas context
      setWebglOk(false);
    };
  }, [colors]);

  return (
    <div ref={containerRef} className={cn("absolute inset-0", className)}>
      {/* Always-on animated fallback for dev / browsers without usable WebGL */}
      <CssMeshFallback colors={colors} />
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-500",
          webglOk ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
    </div>
  );
}
