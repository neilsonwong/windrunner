package main

import (
	"fmt"
	"log"
	"os/exec"
	"runtime"
	"strings"
)

var osxMountPoint string = config.OsxMountPoint

func Open(shareServer string, shareFolder string, file string){
	mountPoint := GetMountPoint(shareServer, shareFolder)
	relPath := mountedFilePath(mountPoint, file) 

	cmd := getOpenCmd(relPath)
	log.Printf("Opening file %s", relPath)

	if err := cmd.Run(); err != nil { 
		log.Printf("Error Opening file %s: %s", relPath, err)
	}  
}

//linux does not use mount points, remove it for now
func MountSmb(shareServer string, shareFolder string, silent bool) error {
	sharename := "//" + config.ShareServer + "/" + config.ShareFolder
	if isMounted(sharename, silent) {
		return nil
	} else {
		cmd := getMountCmd(sharename)
		if err := cmd.Run(); err != nil { 
			if silent == false {
				log.Printf("Error mounting %s: %s", sharename, err)
			}
			return err
		} else {
			if silent == false {
				log.Printf("Successfully mounted %s", sharename)
			}
			return nil
		}
	}
}

func GetMountPoint(shareServer string, shareFolder string,) string {
	switch os := runtime.GOOS; os {
	case "linux":
		//bit hacked for now but lel
		return "/run/user/1000/gvfs/smb-share:server=" + shareServer + ",share=" + shareFolder + "/"
	case "windows":
		return "//" + config.ShareServer + "/" + shareFolder
	case "darwin":
		return osxMountPoint
	default:
		log.Fatalf("%s not supported.", os)
		return ""
	}
}

func isMounted(sharename string, silent bool) bool {
	cmd := getCheckMountCmd(sharename)
	out, err := cmd.Output()
	if err != nil { 
		if silent == false {
			log.Printf("Error from mount check: %s", err)
		}
		return false
	} else {
		if silent == false {
			log.Printf("%s is mounted.\n%s", sharename, out)
		}
		return true
	}
}

func getOpenCmd(file string) *exec.Cmd {
	switch os := runtime.GOOS; os {
	case "linux":
		//xdg-open /run/user/1000/gvfs/smb-share:server=raspberrypi,share=share/anime/White\ Album\ 2/[UTW]_White_Album_2_-_02_[h264-720p][687DEAEA].mkv
		return exec.Command("xdg-open", file)
	case "windows":
		//start \\RASPBERRYPI\share\anime\Baccano!\[Coalgirls]_Baccano!_01_(1280x720_Blu-ray_FLAC)_[09F341E5].mkv
		return exec.Command("cmd", "/C", "start", "", unix2WinFilePath(file))
	case "darwin":
		return exec.Command("/bin/bash", "-c", "open " + file)
	default:
		log.Fatalf("%s not supported.", os)
		return exec.Command("failed")
	}
}

func getCheckMountCmd(sharename string) *exec.Cmd{
	switch os := runtime.GOOS; os {
	case "linux":
		return exec.Command("sh", "-c", "gio mount --list | grep -i " + sharename)
	case "windows":
		//listing the share should return an error if not exists
		return exec.Command("cmd", "/C", "dir", "", unix2WinFilePath(sharename))
	case "darwin":
		//osx mount slightly different from linux
		return exec.Command("sh", "-c", "mount | grep -i " + osxAnonSmbPath(sharename))
	default:
		log.Fatalf("%s not supported.", os)
		return exec.Command("failed")
	}
}

func getMountCmd(sharename string) *exec.Cmd {
	switch os := runtime.GOOS; os {
	case "linux":
		return exec.Command("gio", "mount", "-a", "smb:" + sharename)
	case "windows":
		log.Printf("%s was not accessible on windows network, please check", sharename)
		return exec.Command("failed")
	case "darwin":
		log.Printf("%s", osxMountPoint)
		return exec.Command("sh", "-c", "mount -t smbfs " + osxAnonSmbPath(sharename) + " " + osxMountPoint)
	default:
		log.Fatalf("%s not supported.", os)
		return exec.Command("failed")
	}
}

func unix2WinFilePath(orig string) string {
	return strings.Replace(orig, "/", "\\", -1)
}

func osxAnonSmbPath(sharename string) string {
	return strings.Replace(sharename, "//", "//guest:@", 1)
}

func mountedFilePath(mountPoint, file string) string {
	switch os := runtime.GOOS; os {
	case "linux":
		fallthrough
	case "windows":
		return fmt.Sprintf("%s/%s", mountPoint, file)
	case "darwin":
		return fmt.Sprintf("%s/\"%s\"", mountPoint, file)
	default:
		log.Fatalf("%s not supported.", os)
		return "failed"
	}
}