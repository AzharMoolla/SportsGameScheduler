"""Rebuild precise racket strings over approved artwork with Blender geometry.

Contours are traced in 2048px preview coordinates; each straight strand is
clipped analytically against the inner frame. No generated linework is reused.
"""
import bpy
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/design-review/sport-art-v4'
MODES = ['program'] if '--program-only' in sys.argv else ['program', 'broadcast']
DEST = ROOT / 'docs/design-review/sport-art-v5'
DEST.mkdir(parents=True, exist_ok=True)

CONTOURS = {
    'program': [
        [(142,278),(145,215),(169,155),(210,104),(267,64),(328,39),(389,30),(447,40),(492,67),(517,109),(523,155),(511,203),(483,248),(442,283),(390,311),(333,329),(275,337),(221,332),(178,315),(152,295)],
        [(1878,100),(1887,76),(1902,52),(1923,37),(1947,29),(1970,29),(1991,40),(2004,57),(2007,79),(1998,101),(1981,118),(1958,131),(1934,134),(1910,129),(1890,117)],
    ],
    'broadcast': [
        [(205,283),(199,225),(213,163),(245,110),(290,79),(342,63),(396,60),(448,70),(495,96),(532,133),(557,180),(568,228),(564,277),(545,325),(512,363),(467,393),(415,410),(360,414),(307,407),(261,386),(226,355),(208,320)],
        [(1735,249),(1738,205),(1751,168),(1775,137),(1807,120),(1840,119),(1872,135),(1898,162),(1918,200),(1930,243),(1934,288),(1927,331),(1912,370),(1888,400),(1859,418),(1828,420),(1798,406),(1771,376),(1751,336),(1739,292)],
    ],
}

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    out = nodes.new('ShaderNodeOutputMaterial')
    em = nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*color, 1)
    mat.node_tree.links.new(em.outputs[0], out.inputs['Surface'])
    return mat

def line(name, a, b, width, mat, depth, scale, height):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = width * scale / 2
    curve.bevel_resolution = 2
    spline = curve.splines.new('POLY')
    spline.points.add(1)
    for p, xy in zip(spline.points, [a, b]):
        p.co = (xy[0]*scale, height-xy[1]*scale, depth, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)

def cross(a, b):
    return a[0]*b[1]-a[1]*b[0]

def intersections(poly, origin, direction):
    result = []
    for a,b in zip(poly, poly[1:]+poly[:1]):
        edge = (b[0]-a[0], b[1]-a[1])
        delta = (a[0]-origin[0],a[1]-origin[1])
        denom = cross(direction, edge)
        if abs(denom)<1e-8:
            continue
        t = cross(delta,edge)/denom
        u = cross(delta,direction)/denom
        if -1e-8<=u<=1+1e-8:
            result.append(t)
    if len(result)<2:
        return None
    return [(origin[0]+t*direction[0],origin[1]+t*direction[1]) for t in [min(result),max(result)]]

for mode in MODES:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    source = bpy.data.images.load(str(OUT/f'tennis-{mode}-unstrung.png'))
    width,height = source.size
    scale = width/2048
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.world = bpy.data.worlds.new('World')
    scene.world.color = (0,0,0)
    bpy.ops.object.camera_add(location=(width/2,height/2,1000))
    camera = bpy.context.object
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = width
    camera.data.clip_end = 2000
    scene.camera = camera
    # Image plane preserves the approved backdrop without regenerating it.
    bpy.ops.mesh.primitive_plane_add(size=2, location=(width/2,height/2,0))
    plane = bpy.context.object
    plane.scale = (width/2,height/2,1)
    mat = material('Approved artwork', (1,1,1))
    tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image = source
    em = next(n for n in mat.node_tree.nodes if n.type == 'EMISSION')
    mat.node_tree.links.new(tex.outputs['Color'],em.inputs['Color'])
    plane.data.materials.append(mat)
    ink = material('String edges',(.045,.038,.026) if mode=='program' else (.11,.14,.13))
    shine = material('String highlight',(.26,.25,.20) if mode=='program' else (.73,.82,.78))
    for index, poly in enumerate(CONTOURS[mode]):
        if mode == 'broadcast' and index == 0:
            # Seat the ends into the frame's inner lip, rather than floating
            # just inside the opening after the initial contour trace.
            poly = [(387+(x-387)*1.035,237+(y-237)*1.02) for x,y in poly]
        # Main strings follow each head's longitudinal axis; crosses are orthogonal.
        if mode == 'program':
            # Align the regular grid with the traced head's major axis.
            # Each racket has its own orientation; the grid stays straight.
            cx = sum(x for x, y in poly) / len(poly)
            cy = sum(y for x, y in poly) / len(poly)
            xx = sum((x-cx)**2 for x, y in poly)
            yy = sum((y-cy)**2 for x, y in poly)
            xy = sum((x-cx)*(y-cy) for x, y in poly)
            angle = .5 * math.atan2(2*xy, xx-yy)
        else:
            angle = math.radians(-67 if index==0 else -107)
        directions = [(math.cos(angle),math.sin(angle)),(-math.sin(angle),math.cos(angle))]
        for axis,(direction,count) in enumerate(zip(directions,[16,19])):
            normal = (-direction[1],direction[0])
            projections = [p[0]*normal[0]+p[1]*normal[1] for p in poly]
            low,high = min(projections),max(projections)
            for i in range(count):
                offset = low+(high-low)*(i+1)/(count+1)
                segment = intersections(poly,(normal[0]*offset,normal[1]*offset),direction)
                if not segment:
                    continue
                thickness = (1.9 if mode=='program' else 2.0)*(1 if index==0 else .55)
                prefix = f'Racket{index+1}-axis{axis}-strand{i+1}'
                line(prefix,*segment,thickness,ink,2+axis*.2,scale,height)
                line(prefix+'-highlight',*segment,thickness*.42,shine,3+axis*.2,scale,height)
    destination = DEST if mode == 'program' else OUT
    bpy.ops.wm.save_as_mainfile(filepath=str(destination/f'tennis-{mode}-strings.blend'))
    scene.render.filepath = str(destination/f'tennis-{mode}-banner.png')
    bpy.ops.render.render(write_still=True)
