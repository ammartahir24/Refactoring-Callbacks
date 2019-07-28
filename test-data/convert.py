import glob
import os

os.system('npm run convert-es5')
dir = 'es5/'
files = os.listdir(dir)
# files = [dir + i for i in files]

for i in files:
	fname = i.split('.')[0] + '.JSON'
	os.system('uglifyjs es5/'+i+' -m > mangled/'+i)
	# os.system('uglifyjs --output ast mangled/'+i+' > asts/'+fname)

print(len(files), 'files converted to ast')

