"""Original Silbo basketball studio. Blender --background --factory-startup --python this_file.
No imported meshes, image textures, add-ons or generated artwork. Named geometry/materials/cameras
remain editable. Rebuild dark + illustrated studies; do not overwrite the existing artwork.
"""
import bpy, math, random
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/design-review/blender'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(17)

def material(name, color, metal=0, rough=.5, glow=0, texture=False, painted=False):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color,1); m.use_nodes = True
    n = m.node_tree.nodes; links = m.node_tree.links; p = n.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color,1)
    p.inputs['Metallic'].default_value = metal; p.inputs['Roughness'].default_value = rough
    if glow:
        p.inputs['Emission Color'].default_value = (*color,1); p.inputs['Emission Strength'].default_value = glow
    if texture:
        noise = n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 155 if not painted else 24
        noise.inputs['Detail'].default_value = 3
        bump = n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.28; bump.inputs['Distance'].default_value=.016
        links.new(noise.outputs['Fac'],bump.inputs['Height']); links.new(bump.outputs['Normal'],p.inputs['Normal'])
        if 'leather' in name and not painted:
            pebble=n.new('ShaderNodeTexVoronoi'); pebble.inputs['Scale'].default_value=115
            grain=n.new('ShaderNodeValToRGB'); grain.color_ramp.elements[0].position=.1; grain.color_ramp.elements[0].color=(1,1,1,1)
            grain.color_ramp.elements[1].position=.5; grain.color_ramp.elements[1].color=(.05,.05,.05,1)
            links.new(pebble.outputs['Distance'],grain.inputs[0]); links.new(grain.outputs[0],bump.inputs['Height'])
            bump.inputs['Strength'].default_value=.6; bump.inputs['Distance'].default_value=.022
        ramp=n.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color=(*(c*.55 for c in color),1)
        ramp.color_ramp.elements[1].color=(*color,1)
        links.new(noise.outputs['Fac'],ramp.inputs[0]); links.new(ramp.outputs[0],p.inputs['Base Color'])
    if painted:
        p.inputs['Roughness'].default_value=1
        diffuse=n.new('ShaderNodeBsdfDiffuse'); diffuse.inputs['Color'].default_value=(1,1,1,1)
        rgb=n.new('ShaderNodeShaderToRGB'); ramp=n.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation='CONSTANT'
        ramp.color_ramp.elements[0].position=.22; ramp.color_ramp.elements[0].color=(*(c*.38 for c in color),1)
        ramp.color_ramp.elements[1].position=.58; ramp.color_ramp.elements[1].color=(*color,1)
        mid=ramp.color_ramp.elements.new(.38); mid.color=(*(c*.73 for c in color),1)
        noise=n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=18; noise.inputs['Detail'].default_value=5
        mix=n.new('ShaderNodeMixRGB'); mix.blend_type='MULTIPLY'; mix.inputs[0].default_value=.18
        emit=n.new('ShaderNodeEmission')
        links.new(diffuse.outputs[0],rgb.inputs[0]); links.new(rgb.outputs[0],ramp.inputs[0])
        links.new(ramp.outputs[0],mix.inputs[1]); links.new(noise.outputs['Fac'],mix.inputs[2])
        links.new(mix.outputs[0],emit.inputs[0]); links.new(emit.outputs[0],n.get('Material Output').inputs['Surface'])
    return m

def assign(obj,name,mat):
    obj.name=name; obj.data.materials.append(mat)
    if obj.type=='MESH':
        for face in obj.data.polygons: face.use_smooth=True
    return obj

def box(name,loc,size,mat,bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    assign(o,name,mat)
    if bevel:
        mod=o.modifiers.new('Soft manufactured edges','BEVEL'); mod.width=bevel; mod.segments=3
        o.modifiers.new('Weighted face normals','WEIGHTED_NORMAL')
    return o

def curve(name,points,mat,radius=.014,closed=False):
    data=bpy.data.curves.new(name,'CURVE'); data.dimensions='3D'; data.bevel_depth=radius; data.bevel_resolution=3
    spline=data.splines.new('POLY'); spline.points.add(len(points)-1)
    for p,co in zip(spline.points,points): p.co=(*co,1)
    spline.use_cyclic_u=closed
    o=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(o); data.materials.append(mat); return o

def hoop(center,radius,mat,netmat,prefix):
    x,y,z=center
    bpy.ops.mesh.primitive_torus_add(major_radius=radius,minor_radius=.045,major_segments=96,minor_segments=16,location=center)
    assign(bpy.context.object,prefix+' powder-coated steel rim',mat)
    # Crossed cords sit on a narrowing basket; alternate phases make real diamond openings.
    segments=18; levels=7; depth=.9
    for direction in (-1,1):
        for i in range(segments):
            pts=[]
            for level in range(levels):
                t=level/(levels-1); a=2*math.pi*(i/segments+direction*t*.13)
                r=radius*(1-.36*t)
                pts.append((x+r*math.cos(a),y+r*math.sin(a),z-depth*t))
            curve(f'{prefix} woven net {direction} {i}',pts,netmat,.013)
    for level in (0,3,6):
        t=level/6; r=radius*(1-.36*t)
        curve(prefix+f' net binding {level}',[(x+r*math.cos(a*math.tau/96),y+r*math.sin(a*math.tau/96),z-depth*t) for a in range(96)],netmat,.009,True)

def ball(center,radius,leather,seam,accent,name):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96,ring_count=64,radius=radius,location=center)
    obj=assign(bpy.context.object,name+' pebbled leather',leather)
    for plane in (0,1,2):
        pts=[]
        for i in range(160):
            a=math.tau*i/160; v=[math.cos(a)*radius*1.002,math.sin(a)*radius*1.002,0]
            if plane==1:v=[v[0],0,v[1]]
            if plane==2:v=[0,v[0],v[1]]
            pts.append(tuple(center[j]+v[j] for j in range(3)))
        c=curve(name+f' recessed channel {plane}',pts,seam,.025*radius,True); c.parent=obj; c.matrix_parent_inverse=obj.matrix_world.inverted()
    for side in (-1,1):
        pts=[]
        for i in range(192):
            a=math.tau*i/192; latitude=.40*side+.20*math.sin(2*a)
            v=Vector((math.cos(a)*math.cos(latitude),math.sin(a)*math.cos(latitude),math.sin(latitude)))*radius*1.003
            pts.append(tuple(Vector(center)+v))
        c=curve(name+f' curved panel channel {side}',pts,seam,.022*radius,True); c.parent=obj; c.matrix_parent_inverse=obj.matrix_world.inverted()
    # One restrained illuminated stitch, not an entirely emissive basketball.
    curve(name+' rim-light signature',[(center[0]+radius*math.cos(a),center[1]-.045,center[2]+radius*math.sin(a)) for a in [math.pi*.12+i*math.pi*.68/70 for i in range(71)]],accent,.008)
    return obj

def camera(name,location,target,scale):
    bpy.ops.object.camera_add(location=location); o=bpy.context.object; o.name=name
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    o.data.type='ORTHO'; o.data.ortho_scale=scale; o.data.lens=55; return o

def light(name,location,target,power,size,color):
    bpy.ops.object.light_add(type='AREA',location=location); o=bpy.context.object; o.name=name
    o.data.energy=power; o.data.shape='DISK'; o.data.size=size; o.data.color=color
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()

def build(painted):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    style='program' if painted else 'broadcast'
    floor=material('Warm paper / charcoal stage',(.89,.84,.73) if painted else (.009,.014,.017),rough=.5,texture=True,painted=painted)
    leather=material('Watercolour pigment / micro-pebbled orange leather',(.82,.31,.065) if painted else (.45,.095,.015),rough=.72,texture=True,painted=painted)
    seam=material('Recessed black rubber channels',(.05,.022,.014),rough=.88,painted=painted)
    steel=material('Satin graphite metal',(.10,.13,.14),metal=.78,rough=.30,painted=painted)
    orange=material('Silbo burnt-orange rim',(.95,.23,.035),metal=.55,rough=.24,glow=.25 if not painted else 0,painted=painted)
    linen=material('Braided linen net',(.75,.67,.51),rough=.9,texture=True,painted=painted)
    chalk=material('Court chalk',(.79,.76,.65),rough=.9,painted=painted)
    accent=material('Warm amber lighting signature',(1,.32,.06),glow=3 if not painted else 0,painted=painted)
    court=material('Pigmented maple court',(.55,.29,.09) if painted else (.12,.065,.025),rough=.44,texture=True,painted=painted)
    glass=material('Smoke glass backboard',(.23,.30,.32),metal=.12,rough=.16,painted=painted)
    box('Continuous studio ground',(0,1,-.13),(100,100,.2),floor)
    box('Inlaid court platform',(5.9,1,0),(7,6,.12),court,.06)
    # Individual maple boards, gently varied in colour, no external texture dependency.
    for i in range(24):
        wood=material(f'Maple board tone {i}',tuple(c*(.88+.10*random.random()) for c in ((.58,.32,.13) if painted else (.14,.075,.028))),rough=.48,texture=True,painted=painted)
        box(f'Maple plank {i}',(2.55+i*.28,1,.069),(.273,5.94,.018),wood,.002)
    box('Padded hoop support',(7.6,2.65,1.8),(.34,.42,3.5),steel)
    box('Backboard graphite frame',(6.3,1.6,3.78),(2.38,.16,1.55),steel)
    box('Backboard frosted glass',(6.3,1.49,3.78),(2.22,.08,1.39),glass)
    curve('Backboard target square',[(5.84,1.425,3.48),(6.76,1.425,3.48),(6.76,1.425,4.08),(5.84,1.425,4.08)],chalk,.023,True)
    hoop((6.3,.76,3.18),.55,orange,linen,'Regulation hoop')
    hoop((-6,-.5,1.75),1.35,orange,linen,'Hero sculpture')
    hero=ball((-6,-.5,3.22),1.24,leather,seam,accent,'Hero ball')
    # Object motion is a editable shot study, not a claimed baked physical simulation.
    hero.rotation_euler=(.3,.15,.25); hero.keyframe_insert(data_path='rotation_euler',frame=1)
    hero.rotation_euler=(.3,.15,math.tau+.25); hero.keyframe_insert(data_path='rotation_euler',frame=121)
    ball((4.82,-.52,.53),.44,leather,seam,accent,'Court ball')
    curve('Three-point arc',[(6.3+2.7*math.cos(a),1.0+2.7*math.sin(a),.095) for a in [math.pi+i*math.pi/100 for i in range(101)]],chalk,.018)
    curve('Key markings',[(5.05,1.35,.096),(5.05,-1.65,.096),(7.55,-1.65,.096),(7.55,1.35,.096)],chalk,.018)
    curve('Court boundary',[(2.6,-1.9,.096),(9,-1.9,.096),(9,3.9,.096),(2.6,3.9,.096)],chalk,.018,True)
    # Fine amber floor inlay links both objects across the wide composition.
    curve('Silbo horizon seam',[(-10,3,.012),(10,3,.012)],accent,.008)
    light('Large warm softbox',(-5,-5,8),(-5,0,2),650,5,(1,.74,.43))
    light('Hoop key',(7,-4,8),(6,1,2),2100,4,(1,.85,.66))
    light('Amber rim separation',(-7,2,5),(-6,0,2),1900,2,(1,.32,.07))
    light('Cool edge separation',(-3,4,6),(-5,0,2),1100,3,(.39,.66,.76))
    light('Hoop backlight',(9,4,6),(6,1,3),1600,3,(.55,.78,.9))
    scene=bpy.context.scene; scene.render.engine='BLENDER_EEVEE'
    scene.render.resolution_percentage=100; scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'
    scene.world=bpy.data.worlds.new('Silbo studio environment'); scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.70,.62,.48,1) if painted else (.015,.025,.035,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=.7 if painted else .12
    scene.view_settings.view_transform='Standard' if painted else 'AgX'
    scene.render.film_transparent=False; scene.render.fps=30; scene.frame_end=120; scene.frame_set(1)
    banner=camera('01 Wide banner — continuous scene / centre copy safe',(1,-26,14),(0,.2,2.0),21)
    icon=camera('02 Hero detail / navigation icon',(-8,-10,5),(-6,-.4,2.65),4.9)
    action=camera('03 Court detail',(11,-10,8),(6,.6,2),8)
    scene.camera=banner; scene.render.resolution_x=2400; scene.render.resolution_y=800
    scene['Art direction']='Silbo Field Studio: tactile sports equipment, amber rim light, editorial negative space.'
    scene['Animation status']='Hero rotation shot study. Net is modelled geometry; no cloth or rigid-body simulation baked.'
    scene['Source']='Original procedural Blender geometry, no AI generated image textures.'
    for area in bpy.context.screen.areas:
        if area.type=='VIEW_3D': area.spaces.active.region_3d.view_perspective='CAMERA'
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/f'basketball-{style}.blend'))
    for name,cam,w,h in [('banner',banner,2400,800),('icon',icon,700,700),('action',action,1100,1100)]:
        scene.camera=cam; scene.render.resolution_x=w; scene.render.resolution_y=h
        scene.render.filepath=str(OUT/f'basketball-{style}-{name}.png'); bpy.ops.render.render(write_still=True)
    print('SILBO_STUDIO_RENDERED',style)

build(False)
build(True)
