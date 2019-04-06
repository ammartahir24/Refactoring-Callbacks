import glob
import os

os.system('npm run convert-es5')

files = glob.glob('es5/*.js')

for i in files:
	fname = i.split('/')[1].split('.')[0] +'.JSON'
	os.system('uglifyjs --output ast '+i+' > asts/'+fname)

print(len(files), 'files converted to ast')

