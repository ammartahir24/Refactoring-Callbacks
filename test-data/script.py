import os

lst_files = [
'pixijs_meshextras_test_simplePlane',
'pixijs_spritesheet_test_SpritesheetLoader',
'polymer_utils_gestures',
'hextris_block',
'physicsjs_body_impulse_response',
'modestmaps-js_follower_canvas',
'modestmaps-js_cab_follower'
]

lst_files_js = [i + '.js' for i in lst_files]
lst_files_json = [i+'.json' for i in lst_files]


for i in range(len(lst_files)):
	print(lst_files[i])
	os.system('uglifyjs es5/'+lst_files_js[i] + ' -m -b > mangled/' + lst_files_js[i])
	os.system('uglifyjs -o ast mangled/'+lst_files_js[i] + ' > asts/' + lst_files_json[i])

print('done')